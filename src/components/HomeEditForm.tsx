"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductImage } from "@/components/ProductImage";
import type { HomeContent } from "@/lib/home-content";

export function HomeEditForm({content, hasDraft}:{content:HomeContent;hasDraft:boolean}) {
  const [value,setValue]=useState(content);const [busy,setBusy]=useState(false);const [msg,setMsg]=useState(hasDraft?'Открыт черновик главной страницы':'Изменения появятся на сайте после публикации');const router=useRouter();
  async function save(action:string) {
    setBusy(true);
    try {const res=await fetch('/api/admin/home',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:action==='preview'?'draft':action,content:value})});const data=await res.json();if(!res.ok)throw new Error(data.error);
      setMsg(action==='publish'?'Главная страница опубликована':'Черновик сохранён');
      if(action==='preview')router.push('/?preview=home');else router.refresh();
    }catch(e){setMsg(e instanceof Error?e.message:'Ошибка сохранения');}finally{setBusy(false);}
  }
  async function upload(key:'heroImage'|'whyImage',file?:File) {
    if(!file)return;setBusy(true);
    try {const form=new FormData();form.set('image',file);form.set('kind','hero');const res=await fetch('/api/admin/media',{method:'POST',body:form});const data=await res.json();if(!res.ok)throw new Error(data.error);setValue(v=>({...v,[key]:data.url}));setMsg(data.warning||'Фото добавлено в редактор. Сохраните черновик или опубликуйте страницу.');}
    catch(e){setMsg(e instanceof Error?e.message:'Ошибка загрузки');}finally{setBusy(false);}
  }
  return <form className="mt-8 space-y-5 rounded-2xl bg-white p-5" onSubmit={e=>{e.preventDefault();void save('draft');}}>
    <h2 className="text-xl font-semibold">Главная страница</h2><p role="status" className="rounded-xl bg-[var(--sand)] p-3 text-sm">{msg}</p>
    <fieldset disabled={busy} className="space-y-4">
      {([['heroTitle','Заголовок первого экрана'],['heroText','Текст первого экрана'],['heroAlt','Описание главного изображения'],['whyTitle','Заголовок преимуществ'],['whyText','Текст о серии'],['guideTitle','Заголовок инструкции'],['guideText','Как собрать блок'],['businessTitle','Заголовок для бизнеса'],['businessText','Текст для бизнеса'],['seoTitle','SEO-заголовок главной'],['seoDescription','SEO-описание главной']] as const).map(([key,label])=><label key={key} className="grid gap-1 text-sm">{label}<textarea rows={key.endsWith('Text')?3:2} className="rounded-xl border px-3 py-2" value={value[key]} onChange={e=>setValue({...value,[key]:e.target.value})}/></label>)}
      {value.benefits.map((b,i)=><label key={i} className="grid gap-1 text-sm">Преимущество {i+1}<input className="rounded-xl border px-3 py-2" value={b} onChange={e=>setValue({...value,benefits:value.benefits.map((text,j)=>j===i?e.target.value:text)})}/></label>)}
      {(['heroImage','whyImage'] as const).map(key=><div key={key} className="space-y-2"><ProductImage src={value[key]} alt="Текущее изображение" className="h-40 w-full rounded-xl bg-[var(--paper)] p-4"/><label className="grid gap-1 text-sm">{key==='heroImage'?'Изображение первого экрана':'Изображение о серии'}<input type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={e=>void upload(key,e.target.files?.[0])}/></label></div>)}
      <p className="text-xs text-[var(--muted)]">Интерьерные фото — от 2000 px по длинной стороне, до 12 МБ. Оставляйте поля вокруг важных деталей для мобильного экрана.</p>
    </fieldset>
    <div className="flex flex-wrap gap-3"><button disabled={busy} className="btn btn-copper">Сохранить черновик</button><button disabled={busy} type="button" className="btn btn-copper" onClick={()=>void save('preview')}>Предпросмотр</button><button disabled={busy} type="button" className="btn btn-primary" onClick={()=>void save('publish')}>Опубликовать</button>{hasDraft&&<button disabled={busy} type="button" className="btn btn-ghost" onClick={()=>void save('discard')}>Удалить черновик</button>}</div>
  </form>;
}
