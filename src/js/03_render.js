// ---------------------------------------------------------------------------
// Renderização: MSAA HDR -> bloom em cascata -> composição cinematográfica
// (ACES, grão de filme, vinheta, aberração cromática, sujeira de lente, letterbox)
// ---------------------------------------------------------------------------
const R = {};
function initRenderer(Q) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', stencil: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, Q >= 2 ? 1.75 : (Q === 1 ? 1.25 : .85)));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = Q > 0; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  document.getElementById('app').appendChild(renderer.domElement);
  R.renderer = renderer; R.Q = Q;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x000000); R.scene = scene;
  scene.fog = new THREE.FogExp2(0x05060a, .028);
  const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, .03, 300); camera.rotation.order = 'YXZ'; R.camera = camera; scene.add(camera);
  const isGL2 = renderer.capabilities.isWebGL2;
  const mk = (w, h, s = 0) => new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: s, depthBuffer: !!s || false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  R.rtMain = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: isGL2 ? (Q >= 1 ? 4 : 2) : 0, depthBuffer: true });
  R.rtB = []; for (let i = 0; i < 4; i++) R.rtB.push([mk(1, 1), mk(1, 1)]);
  const quadGeo = new THREE.BufferGeometry(); quadGeo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3)); quadGeo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  R.quadScene = new THREE.Scene(); R.quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); R.quad = new THREE.Mesh(quadGeo); R.quad.frustumCulled = false; R.quadScene.add(R.quad);
  const vs = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`;
  R.matBright = new THREE.ShaderMaterial({ uniforms: { t: { value: null }, th: { value: 1.0 } }, vertexShader: vs, depthTest: false, depthWrite: false,
    fragmentShader: `uniform sampler2D t; uniform float th; varying vec2 vUv; void main(){ vec3 c=texture2D(t,vUv).rgb; float l=max(max(c.r,c.g),c.b); float k=smoothstep(th, th*2.2, l); gl_FragColor=vec4(min(c*k, vec3(40.)),1.); }` });
  R.matBlur = new THREE.ShaderMaterial({ uniforms: { t: { value: null }, dir: { value: new THREE.Vector2() } }, vertexShader: vs, depthTest: false, depthWrite: false,
    fragmentShader: `uniform sampler2D t; uniform vec2 dir; varying vec2 vUv; void main(){ vec3 s=texture2D(t,vUv).rgb*0.2270270;
      s+=texture2D(t,vUv+dir*1.3846153).rgb*0.3162162; s+=texture2D(t,vUv-dir*1.3846153).rgb*0.3162162;
      s+=texture2D(t,vUv+dir*3.2307692).rgb*0.0702702; s+=texture2D(t,vUv-dir*3.2307692).rgb*0.0702702; gl_FragColor=vec4(s,1.); }` });
  R.matFinal = new THREE.ShaderMaterial({
    uniforms: { tScene: { value: null }, tB0: { value: null }, tB1: { value: null }, tB2: { value: null }, tB3: { value: null }, tDirt: { value: null },
      uTime: { value: 0 }, uExposure: { value: 1 }, uBloom: { value: .55 }, uVig: { value: .55 }, uGrain: { value: .06 }, uCA: { value: 1.0 }, uFade: { value: 1 }, uFocus: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) }, uDesat: { value: 0 }, uRed: { value: 0 }, uFlash: { value: 0 }, uLB: { value: 0 }, uBlur: { value: 0 } },
    vertexShader: vs, depthTest: false, depthWrite: false,
    fragmentShader: `
    uniform sampler2D tScene,tB0,tB1,tB2,tB3,tDirt; uniform float uTime,uExposure,uBloom,uVig,uGrain,uCA,uFade,uFocus,uDesat,uRed,uFlash,uLB,uBlur; uniform vec2 uRes; varying vec2 vUv;
    vec3 RRTAndODTFit(vec3 v){ vec3 a=v*(v+0.0245786)-0.000090537; vec3 b=v*(0.983729*v+0.4329510)+0.238081; return a/b; }
    vec3 ACES(vec3 c){ const mat3 i=mat3(vec3(0.59719,0.07600,0.02840),vec3(0.35458,0.90834,0.13383),vec3(0.04823,0.01566,0.83777));
      const mat3 o=mat3(vec3(1.60475,-0.10208,-0.00327),vec3(-0.53108,1.10813,-0.07276),vec3(-0.07367,-0.00605,1.07602)); c=i*c; c=RRTAndODTFit(c); c=o*c; return clamp(c,0.,1.); }
    float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
    vec3 toSRGB(vec3 c){ return mix(c*12.92, 1.055*pow(c,vec3(1./2.4))-0.055, step(0.0031308,c)); }
    void main(){
      vec2 uv=vUv; vec2 d=uv-.5; float r2=dot(d,d);
      vec2 cuv=uv; // leve distorção de lente
      cuv = .5 + d*(1. - .035*r2);
      float ca = uCA*0.0022*r2*4.;
      vec3 col;
      col.r=texture2D(tScene,cuv+d*ca).r; col.g=texture2D(tScene,cuv).g; col.b=texture2D(tScene,cuv-d*ca).b;
      float foc = max(uFocus*smoothstep(.03,.25,r2), uBlur);
      if(foc>0.001){ vec3 bl=vec3(0.); float tw=0.;
        for(int i=0;i<12;i++){ float a=float(i)*2.39996; float rr=sqrt(float(i)+.5)/3.5; vec2 o=vec2(cos(a),sin(a))*rr*foc*0.018*vec2(uRes.y/uRes.x,1.); bl+=texture2D(tScene,cuv+o).rgb; tw+=1.; }
        col=mix(col, bl/tw, clamp(foc*1.2,0.,1.)); }
      vec3 bloom = texture2D(tB0,cuv).rgb*.45 + texture2D(tB1,cuv).rgb*.3 + texture2D(tB2,cuv).rgb*.2 + texture2D(tB3,cuv).rgb*.25;
      vec3 dirt = texture2D(tDirt,uv).rgb;
      col += bloom*uBloom + bloom*dirt*uBloom*1.6;
      col *= uExposure;
      float lum=dot(col,vec3(.2126,.7152,.0722)); col=mix(col,vec3(lum),uDesat);
      col = ACES(col);
      // gradação: sombras frias, médios neutros
      col = pow(col, vec3(1.02,1.0,.97)); col += vec3(-.004,.0,.012)*(1.-col);
      float vig = smoothstep(.85, .18, length(d*vec2(uRes.x/uRes.y*.85,1.))); col *= mix(1., vig, uVig);
      col = mix(col, col*vec3(1.25,.35,.3), uRed*(1.-vig*.6));
      col = toSRGB(col);
      float g = h(uv*uRes + fract(uTime*7.3)*100.) - .5; float lumS=dot(col,vec3(.333)); col += g*uGrain*(1.2-lumS*.8);
      col += uFlash;
      col *= (1.-uFade);
      float lb = uLB*.11; if(uv.y<lb || uv.y>1.-lb) col=vec3(0.);
      gl_FragColor=vec4(col,1.);
    }` });
  R.matCopy = new THREE.MeshBasicMaterial();
  onResize(); addEventListener('resize', onResize);
}
function onResize() {
  const r = R.renderer; r.setSize(innerWidth, innerHeight); R.camera.aspect = innerWidth / innerHeight; R.camera.updateProjectionMatrix();
  const v = new THREE.Vector2(); r.getDrawingBufferSize(v); R.rtMain.setSize(v.x, v.y);
  let w = Math.max(1, v.x >> 1), h = Math.max(1, v.y >> 1);
  for (let i = 0; i < 4; i++) { R.rtB[i][0].setSize(w, h); R.rtB[i][1].setSize(w, h); w = Math.max(1, w >> 1); h = Math.max(1, h >> 1); }
  if (R.matFinal) R.matFinal.uniforms.uRes.value.set(v.x, v.y);
}
function renderFrame(t) {
  const r = R.renderer;
  r.setRenderTarget(R.rtMain); r.render(R.scene, R.camera);
  // bloom
  R.quad.material = R.matBright; R.matBright.uniforms.t.value = R.rtMain.texture; r.setRenderTarget(R.rtB[0][0]); r.render(R.quadScene, R.quadCam);
  let src = R.rtB[0][0];
  for (let i = 0; i < 4; i++) {
    const [a, b] = R.rtB[i];
    if (i > 0) { R.quad.material = R.matBlur; R.matBlur.uniforms.t.value = src.texture; R.matBlur.uniforms.dir.value.set(0, 0); r.setRenderTarget(a); r.render(R.quadScene, R.quadCam); }
    R.quad.material = R.matBlur; R.matBlur.uniforms.t.value = a.texture; R.matBlur.uniforms.dir.value.set(1 / a.width, 0); r.setRenderTarget(b); r.render(R.quadScene, R.quadCam);
    R.matBlur.uniforms.t.value = b.texture; R.matBlur.uniforms.dir.value.set(0, 1 / a.height); r.setRenderTarget(a); r.render(R.quadScene, R.quadCam);
    src = a;
  }
  const U = R.matFinal.uniforms; U.tScene.value = R.rtMain.texture; U.tB0.value = R.rtB[0][0].texture; U.tB1.value = R.rtB[1][0].texture; U.tB2.value = R.rtB[2][0].texture; U.tB3.value = R.rtB[3][0].texture; U.uTime.value = t;
  R.quad.material = R.matFinal; r.setRenderTarget(null); r.render(R.quadScene, R.quadCam);
}

// ---- material do céu visto pelas janelas (estrelas, lua, mar de nuvens ao luar) ----
function makeSkyMaterial(skyCube, moonTex) {
  return new THREE.ShaderMaterial({
    uniforms: { tSky: { value: skyCube }, tMoon: { value: moonTex }, uTime: { value: 0 }, uMoon: { value: V3(-.55, .32, -.25).normalize() }, uStrobe: { value: 0 }, uDawn: { value: 0 }, uLight: { value: 1 } },
    vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform samplerCube tSky; uniform sampler2D tMoon; uniform float uTime,uStrobe,uDawn,uLight; uniform vec3 uMoon; varying vec3 vW;
      float hs(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x),f.y); }
      float fbm(vec2 p){ float s=0.,a=.5; for(int i=0;i<5;i++){ s+=a*vn(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return s; }
      void main(){
        vec3 dir=normalize(vW-cameraPosition);
        vec3 col=vec3(0.);
        float hz = dir.y;
        // estrelas (cubemap Via Láctea, escurecido) acima do horizonte
        vec3 st = textureCube(tSky, dir).rgb; st = pow(st, vec3(1.8))*1.6;
        col = st*smoothstep(-.02,.12,hz);
        // brilho atmosférico do horizonte (airglow)
        col += vec3(.014,.022,.042)*exp(-abs(hz)*12.)*1.6;
        col += vec3(.55,.30,.16)*uDawn*exp(-abs(hz-.01)*10.)*.6;
        // lua
        float md = dot(dir,uMoon); if(md>0.9996){ vec3 r=normalize(cross(uMoon,vec3(0,1,0))); vec3 u=cross(r,uMoon); vec2 muv=vec2(dot(dir-uMoon,r),dot(dir-uMoon,u))/0.0283*.5+.5; vec3 m=texture2D(tMoon,muv).rgb; float disc=smoothstep(.5,.48,length(muv-.5)); col+=pow(m,vec3(2.2))*6.*disc; }
        col += vec3(.6,.7,.9)*pow(max(md,0.),900.)*.35 + vec3(.3,.35,.5)*pow(max(md,0.),40.)*.03;
        // mar de nuvens 8 km abaixo, movendo-se para trás (avião a ~250 m/s)
        if(hz < 0.){
          vec2 p = dir.xz/(-hz+.02)*0.9; p.y += uTime*.028; p.x+=.3;
          float c = fbm(p*1.3); float c2 = fbm(p*4.+c*2.);
          float dens = smoothstep(.38,.75,c*.75+c2*.35);
          float lit = .35+.65*smoothstep(.3,.9,c2);
          vec3 moonCol = vec3(.13,.15,.20)*(.6+.8*max(0.,dot(normalize(vec3(dir.x,.4,dir.z)),uMoon)));
          vec3 ocean = vec3(.002,.003,.006);
          vec3 cl = mix(ocean, moonCol*lit, dens);
          float haze = exp(-(-hz)*7.); cl = mix(cl, vec3(.018,.024,.04), haze*.85);
          col = cl + vec3(.5,.28,.15)*uDawn*haze*.5;
        }
        col += vec3(1.,1.,1.)*uStrobe*.08;
        col *= uLight;
        gl_FragColor=vec4(col,1.);
      }`
  });
}
