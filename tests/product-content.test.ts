import {test} from 'node:test';
import assert from 'node:assert/strict';
import {constructorEnabled, productBenefits, productEditorSchema, photosOf, publicAttrs} from '../src/lib/product-content';
import {displayProduct, productAlt} from '../src/lib/product-display';
import {getBundlePhoto} from '../src/lib/bundle';

test('new modules are enabled by saved configuration, assembled items never qualify',()=>{
  assert.equal(constructorEnabled({sku:'CUSTOM-WH',kitRole:'mechanism',attrsJson:'{"_constructorEnabled":"true"}'}),true);
  assert.equal(constructorEnabled({sku:'CUSTOM-WH',kitRole:'assembled',attrsJson:'{"_constructorEnabled":"true"}'}),false);
  assert.equal(constructorEnabled({sku:'M-D1-WH',kitRole:'mechanism',attrsJson:'{"_constructorEnabled":"false"}'}),false);
  assert.equal(constructorEnabled({sku:'M-D1-WH',kitRole:'mechanism'}),true);
});
test('only confirmed model attributes become benefits; frames exclude electrical claims',()=>{
  assert.deepEqual(productBenefits({kitRole:'assembled',attrsJson:'{}'}),[]);
  assert.deepEqual(productBenefits({kitRole:'frame',attrsJson:'{"Подключение":"самозажимные клеммы","Шторки":"да"}'}),[]);
  assert.deepEqual(productBenefits({kitRole:'mechanism',attrsJson:'{"Подключение":"быстрое подключение","Шторки":"да"}'}),['Самозажимные клеммы','Лёгкий монтаж','Защитные шторки']);
  assert.deepEqual(publicAttrs('{"_constructorEnabled":"true","Ток":"16 А"}'),{'Ток':'16 А'});
});
test('published names/descriptions override legacy SKU copy; switch alt has correct gender',()=>{
  assert.equal(displayProduct({sku:'S1-WH',name:'Новый выключатель',description:'Описание владельца'}).description,'Описание владельца');
  assert.equal(displayProduct({sku:'S1-WH',name:'Новый выключатель'}).title,'Новый выключатель');
  assert.match(productAlt({sku:'S1P-WH',name:'Проходной выключатель',color:'белый'}),/^Белый проходной выключатель/);
});
test('gallery order and captions survive serialization; legacy galleries remain compatible',()=>{
  assert.deepEqual(photosOf({imagesJson:'[{"url":"/front.webp","caption":"Спереди"},{"url":"/back.webp","caption":"Сзади"}]'}).map(p=>p.caption),['Спереди','Сзади']);
  assert.equal(photosOf({imagesJson:'["/old.png"]'})[0].url,'/old.png');
});
test('block photos require exact left-to-right configuration',()=>{
  assert.equal(getBundlePhoto('серый',['m-d1','m-d1','m-tv']),null);
  assert.ok(getBundlePhoto('серый',['m-tv','m-d1','m-d1']));
  assert.equal(getBundlePhoto('белый',['custom','m-d1']),null);
});
test('publication rejects invalid roles, prices, posts and image URLs',()=>{
  const p={name:'Товар',sku:'X',slug:'x',description:'',color:'белый',series:'Zero',kitRole:'mechanism',productType:'розетка',warranty:'',posts:1,priceRetail:0,stock:0,active:true,constructorEnabled:true,attrs:{},photos:[],categoryIds:[],seoTitle:'',seoDescription:''};
  assert.equal(productEditorSchema.safeParse(p).success,true);
  for(const patch of [{kitRole:'assembled'},{kitRole:'frame',posts:1},{posts:2},{priceRetail:-1},{stock:1.5},{photos:[{url:'javascript:alert(1)',caption:''}]}])assert.equal(productEditorSchema.safeParse({...p,...patch}).success,false);
});
