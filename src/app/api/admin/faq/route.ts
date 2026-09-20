import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { requireStaff } from '@/lib/admin';
import { getHomeFaqs } from '@/lib/home-faqs';
export async function POST(req:NextRequest) {
  const {error}=await requireStaff();if(error)return error;
  try {
    const body=await req.json();const key='draft:faqs';
    if(body.action==='discard'){await prisma.siteSetting.deleteMany({where:{key}});return NextResponse.json({ok:true});}
    let rows=await getHomeFaqs(true);
    if(body.action==='publish') {
      await prisma.$transaction(async tx=>{await tx.faqItem.deleteMany();for(const row of rows)await tx.faqItem.create({data:row});await tx.siteSetting.deleteMany({where:{key}});});
      return NextResponse.json({ok:true});
    }
    const question=String(body.question||'').trim().slice(0,300),answer=String(body.answer||'').trim().slice(0,4000);
    if(['create','update'].includes(body.action)&&(!question||!answer))return NextResponse.json({error:'Заполните вопрос и ответ'},{status:400});
    if(body.action==='create')rows.push({id:randomUUID(),question,answer,sortOrder:rows.length+1});
    else if(body.action==='update')rows=rows.map(r=>r.id===body.id?{...r,question,answer}:r);
    else if(body.action==='delete')rows=rows.filter(r=>r.id!==body.id);
    else return NextResponse.json({error:'Неизвестное действие'},{status:400});
    const value=JSON.stringify(rows);await prisma.siteSetting.upsert({where:{key},create:{key,value},update:{value}});
    return NextResponse.json({ok:true});
  }catch{return NextResponse.json({error:'Не удалось сохранить вопросы'},{status:400});}
}
