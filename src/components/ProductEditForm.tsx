"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductImage } from "@/components/ProductImage";
import type { ProductEditor } from "@/lib/product-content";

export function ProductEditForm({id, product, categories, hasDraft}: {id:string; product:ProductEditor; categories:{id:string;name:string}[]; hasDraft:boolean}) {
  const router = useRouter();
  const [value, setValue] = useState(product);
  const [attrs, setAttrs] = useState(Object.entries(product.attrs));
  const [msg, setMsg] = useState(hasDraft ? "Открыт сохранённый черновик. Посетители видят опубликованную версию." : "Изменения появятся на сайте только после публикации.");
  const [busy, setBusy] = useState(false);
  const field = "w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2";
  function set<K extends keyof ProductEditor>(key:K, next:ProductEditor[K]) {setValue(v=>({...v,[key]:next}));}
  async function save(action: "draft" | "publish" | "preview" | "discard") {
    setBusy(true);
    try {
      const keys = attrs.filter(([k])=>k.trim()).map(([k])=>k.trim());
      if (new Set(keys).size !== keys.length) throw new Error("Названия характеристик не должны повторяться");
      const res = await fetch("/api/admin/product", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,action:action === "preview" ? "draft" : action,product:{...value,attrs:Object.fromEntries(attrs.filter(([k])=>k.trim()).map(([k,v])=>[k.trim(),v]))}})});
      const data = await res.json(); if (!res.ok) throw new Error(data.error);
      setMsg(action === "publish" ? "Товар опубликован" : "Черновик сохранён");
      if (action === "preview") router.push(`/admin/preview/product/${id}`);
      else if (action === "discard") router.push("/admin/products");
      else {router.replace(`/admin/products/${id}`);router.refresh();}
    } catch (e) {setMsg(e instanceof Error ? e.message : "Не удалось сохранить");} finally {setBusy(false);}
  }
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const photos = [...value.photos];
      for (const file of Array.from(files)) {
        const form = new FormData();form.set("image",file);
        const res = await fetch("/api/admin/media",{method:"POST",body:form});const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        photos.push({url:data.url,caption:photos.length ? "Детали изделия" : "Вид спереди"});
        setMsg(data.warning || "Фото загружено в редактор. Сохраните черновик или опубликуйте товар.");
      }
      set("photos",photos);
    } catch(e) {setMsg(e instanceof Error ? e.message : "Ошибка загрузки");} finally {setBusy(false);}
  }
  function move(index:number, step:number) {const photos=[...value.photos];[photos[index],photos[index+step]]=[photos[index+step],photos[index]];set("photos",photos);}
  return <form onSubmit={e=>{e.preventDefault();void save("draft");}} className="mt-6 space-y-6 rounded-2xl bg-white p-5 text-sm sm:p-8">
    <p role="status" className="rounded-xl bg-[var(--sand)] p-3">{msg}</p>
    <fieldset disabled={busy} className="space-y-5 disabled:opacity-60">
      <legend className="mb-4 text-lg font-semibold">Данные товара</legend>
      {([['name','Название'],['sku','Артикул'],['slug','Адрес страницы'],['series','Серия'],['warranty','Гарантия'],['seoTitle','SEO-заголовок'],['seoDescription','SEO-описание']] as const).map(([key,label])=><label key={key} className="grid gap-1">{label}<input className={field} value={value[key]} onChange={e=>set(key,e.target.value)} required={['name','sku','slug'].includes(key)} /></label>)}
      <label className="grid gap-1">Описание<textarea rows={5} className={field} value={value.description} onChange={e=>set('description',e.target.value)} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1">Формат<select className={field} value={value.kitRole} onChange={e=>{const kitRole=e.target.value as ProductEditor['kitRole'];setValue(v=>({...v,kitRole,posts:kitRole==='frame'?2:1,constructorEnabled:kitRole==='mechanism'&&v.constructorEnabled}));}}><option value="assembled">Готовое изделие</option><option value="mechanism">Модуль для рамки</option><option value="frame">Рамка</option></select></label>
        <label className="grid gap-1">Цвет<select className={field} value={value.color} onChange={e=>set('color',e.target.value as ProductEditor['color'])}>{['белый','серый','чёрный'].map(c=><option key={c}>{c}</option>)}</select></label>
        <label className="grid gap-1">Тип<select className={field} value={value.productType} onChange={e=>set('productType',e.target.value)}>{['розетка','выключатель','рамка','механизм'].map(t=><option key={t}>{t}</option>)}</select></label>
        <label className="grid gap-1">Количество постов<select className={field} value={value.posts} onChange={e=>set('posts',Number(e.target.value))}>{(value.kitRole==='frame'?[2,3,4]:[1]).map(n=><option key={n} value={n}>{n}</option>)}</select></label>
        <label className="grid gap-1">Цена, ₽<input type="number" min="0" step="0.01" className={field} value={value.priceRetail} onChange={e=>set('priceRetail',Number(e.target.value))}/></label>
        <label className="grid gap-1">Остаток, шт.<input type="number" min="0" step="1" className={field} value={value.stock} onChange={e=>set('stock',Number(e.target.value))}/></label>
      </div>
      <fieldset><legend className="mb-2 font-medium">Категории</legend><div className="flex flex-wrap gap-4">{categories.map(c=><label key={c.id} className="flex gap-2"><input type="checkbox" checked={value.categoryIds.includes(c.id)} onChange={e=>set('categoryIds',e.target.checked?[...value.categoryIds,c.id]:value.categoryIds.filter(id=>id!==c.id))}/>{c.name}</label>)}</div></fieldset>
      <label className="flex items-center gap-2"><input type="checkbox" checked={value.active} onChange={e=>set('active',e.target.checked)}/>Показывать товар на сайте после публикации</label>
      <label className="flex items-center gap-2"><input type="checkbox" disabled={value.kitRole!=='mechanism'} checked={value.constructorEnabled} onChange={e=>set('constructorEnabled',e.target.checked)}/>Показывать модуль в конструкторе</label>
      <p className="text-xs text-[var(--muted)]">В конструкторе доступны только опубликованные модули выбранного цвета. Для вариантов цвета используйте общий артикул с окончаниями -WH, -GY, -BK.</p>
      <fieldset className="space-y-3"><legend className="mb-3 text-lg font-semibold">Подтверждённые характеристики</legend>
        {attrs.map(([key,val],i)=><div key={i} className="flex gap-2"><input aria-label={`Характеристика ${i+1}`} className={field} placeholder="Название" value={key} onChange={e=>setAttrs(attrs.map((a,j)=>j===i?[e.target.value,a[1]]:a))}/><input aria-label={`Значение ${i+1}`} className={field} placeholder="Значение" value={val} onChange={e=>setAttrs(attrs.map((a,j)=>j===i?[a[0],e.target.value]:a))}/><button type="button" aria-label={`Удалить характеристику ${i+1}`} onClick={()=>setAttrs(attrs.filter((_,j)=>j!==i))}>×</button></div>)}
        <button type="button" className="underline" onClick={()=>setAttrs([...attrs,['','']])}>Добавить характеристику</button>
        <p className="text-xs text-[var(--muted)]">Например: «Подключение — самозажимные клеммы», «Шторки — да». Добавляйте только подтверждённые свойства этой модели. Для поверхности используйте «матовая окрашенная поверхность».</p>
      </fieldset>
      <fieldset className="space-y-3"><legend className="mb-3 text-lg font-semibold">Фотографии и подписи</legend>
        <p>Первым поставьте вид спереди. Заднюю сторону и детали — после него.</p>
        {value.photos.map((photo,i)=><div key={i} className="grid grid-cols-[72px_1fr] gap-3 rounded-xl border p-3"><ProductImage src={photo.url} alt={photo.caption} className="h-18 w-18 bg-[var(--paper)] p-2"/><div className="min-w-0 space-y-2"><label className="grid gap-1">Подпись {i+1}<input className={field} value={photo.caption} onChange={e=>set('photos',value.photos.map((p,j)=>j===i?{...p,caption:e.target.value}:p))}/></label><div className="flex flex-wrap gap-3"><button type="button" disabled={i===0} onClick={()=>move(i,-1)}>↑ Раньше</button><button type="button" disabled={i===value.photos.length-1} onClick={()=>move(i,1)}>↓ Позже</button><button type="button" onClick={()=>set('photos',value.photos.filter((_,j)=>j!==i))}>Удалить фото</button></div></div></div>)}
        <label className="grid gap-2">Добавить фотографии<input type="file" accept="image/png,image/jpeg,image/webp,image/avif" multiple onChange={e=>void upload(e.target.files)}/></label>
        <p className="text-xs text-[var(--muted)]">До 12 МБ на фото. Изображения сохраняются в WebP 1600 × 1600 с полями; пропорции сохраняются.</p>
      </fieldset>
    </fieldset>
    <div className="flex flex-wrap gap-3"><button disabled={busy} className="btn btn-copper" type="submit">Сохранить черновик</button><button disabled={busy} type="button" className="btn btn-copper" onClick={()=>void save('preview')}>Предпросмотр</button><button disabled={busy} type="button" className="btn btn-primary" onClick={()=>void save('publish')}>Опубликовать</button>{hasDraft&&<button disabled={busy} type="button" className="btn btn-ghost" onClick={()=>void save('discard')}>Удалить черновик</button>}</div>
  </form>;
}
