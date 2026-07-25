"use client";
import { useEffect, useRef } from "react";

export function ToothScene() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: true });
    if (!gl) return;
    const vertex = `attribute vec2 p; varying vec2 uv; void main(){uv=p;gl_Position=vec4(p,0.,1.);}`;
    const fragment = `precision highp float; varying vec2 uv; uniform float t; uniform vec2 mouse;
      float sdEllipse(vec2 p, vec2 ab){float k0=length(p/ab);float k1=length(p/(ab*ab));return k0*(k0-1.0)/k1;}
      float tooth(vec2 p){p.x+=sin(p.y*3.0)*.035;float crown=sdEllipse(p-vec2(0.,.22),vec2(.47,.55));float root1=sdEllipse(p-vec2(-.17,-.45),vec2(.18,.52));float root2=sdEllipse(p-vec2(.17,-.45),vec2(.18,.52));return min(crown,max(min(root1,root2),-sdEllipse(p-vec2(0.,-.3),vec2(.08,.5))));}
      void main(){vec2 p=uv; p.x*=1.12; float a=(mouse.x-.5)*.32+sin(t*.35)*.04; p=mat2(cos(a),-sin(a),sin(a),cos(a))*p; float d=tooth(p); float edge=smoothstep(.015,-.015,d); vec3 bg=vec3(.86,.96,.93); float light=.68+.32*dot(normalize(vec3(p*.9,sqrt(max(.01,1.-dot(p,p))))),normalize(vec3(-.5,.8,1.))); vec3 col=mix(bg,vec3(.97,1.,.995)*light,edge); col+=vec3(.25,.9,.72)*exp(-abs(d)*23.)*.18; float ring=abs(length(p)-.78); col=mix(col,vec3(.2,.78,.62),smoothstep(.006,.0,ring)*.55); gl_FragColor=vec4(col,1.);}`;
    const shader = (type:number, src:string) => { const s=gl.createShader(type)!; gl.shaderSource(s,src); gl.compileShader(s); return s; };
    const program=gl.createProgram()!; gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex)); gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment)); gl.linkProgram(program); gl.useProgram(program);
    const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const pos=gl.getAttribLocation(program,"p"); gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    const time=gl.getUniformLocation(program,"t"), mouse=gl.getUniformLocation(program,"mouse"); let mx=.5,my=.5,raf=0;
    const move=(e:PointerEvent)=>{const r=canvas.getBoundingClientRect();mx=(e.clientX-r.left)/r.width;my=(e.clientY-r.top)/r.height}; canvas.addEventListener("pointermove",move);
    const render=(n:number)=>{const d=Math.min(devicePixelRatio,2);const w=canvas.clientWidth*d,h=canvas.clientHeight*d;if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}gl.uniform1f(time,n/1000);gl.uniform2f(mouse,mx,my);gl.drawArrays(gl.TRIANGLES,0,6);raf=requestAnimationFrame(render)};raf=requestAnimationFrame(render);
    return()=>{cancelAnimationFrame(raf);canvas.removeEventListener("pointermove",move)};
  },[]);
  return <canvas ref={ref} />;
}
