(function () {
  const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;
  const FRAG = `
precision mediump float;
uniform vec2 u_res; uniform float u_t;
// palette
const vec3 CHIFFON = vec3(0.945,0.941,0.800);
const vec3 FAWN    = vec3(0.835,0.749,0.525);
const vec3 FLAME   = vec3(1.000,0.255,0.000);
const vec3 MAHOG   = vec3(0.247,0.051,0.071);
const vec3 EVER    = vec3(0.098,0.212,0.153);
float hash(vec2 q){ return fract(sin(dot(q, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 q){
  vec2 i=floor(q), f=fract(q); vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x), mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x), u.y);
}
float fbm(vec2 q){ float v=0.,a=.5; for(int i=0;i<5;i++){ v+=a*noise(q); q*=2.03; a*=.55; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  float t = u_t*0.06;
  // flowing warp
  vec2 w = vec2(fbm(uv*3. + vec2(t, -t*.7)), fbm(uv*3. + vec2(-t*.8, t*.5)));
  float m = fbm(uv*2.2 + w*1.6 + vec2(t*.4, 0.));
  // vertical depth: chiffon at top -> deep at bottom
  float depth = smoothstep(0., 1., 1.-uv.y) * (0.75 + 0.25*m);
  vec3 col = mix(CHIFFON, FAWN, smoothstep(0.05, 0.45, depth));
  col = mix(col, MAHOG, smoothstep(0.45, 0.85, depth));
  col = mix(col, EVER, smoothstep(0.75, 1., depth) * smoothstep(0.4,0.7,fbm(uv*4.+w)));
  // flame ribbon
  float ribbon = smoothstep(0.04, 0.0, abs(m - (0.62 - uv.y*0.25)) - 0.015);
  col = mix(col, FLAME, ribbon * smoothstep(0.15, 0.55, depth));
  gl_FragColor = vec4(col, 1.);
}`;
  class ShaderFooter extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      this.style.display = 'block'; this.style.position = 'relative'; this.style.overflow = 'hidden';
      if (!this.style.height && !this.getAttribute('height')) this.style.height = '220px';
      const c = document.createElement('canvas');
      c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
      this.appendChild(c);
      const gl = c.getContext('webgl', { antialias: false });
      if (!gl) { this.style.background = 'linear-gradient(#F1F0CC, #3F0D12)'; return; }
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog); gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const uRes = gl.getUniformLocation(prog, 'u_res');
      const uT = gl.getUniformLocation(prog, 'u_t');
      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = this.clientWidth * dpr, h = this.clientHeight * dpr;
        if (c.width !== w || c.height !== h) { c.width = w; c.height = h; gl.viewport(0, 0, w, h); }
      };
      this._ro = new ResizeObserver(resize); this._ro.observe(this);
      const t0 = performance.now();
      const loop = () => {
        this._raf = requestAnimationFrame(loop);
        resize();
        gl.uniform2f(uRes, c.width, c.height);
        gl.uniform1f(uT, (performance.now() - t0) / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
      loop();
    }
    disconnectedCallback() { cancelAnimationFrame(this._raf); if (this._ro) this._ro.disconnect(); this._init = false; this.innerHTML = ''; }
  }
  if (!customElements.get('shader-footer')) customElements.define('shader-footer', ShaderFooter);
})();
