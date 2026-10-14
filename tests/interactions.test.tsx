import './setup';
import React from 'react';
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { render, fireEvent, cleanup, act, waitFor } from '@testing-library/react';
import App from '../src/App';
import { BASIC_STARTER_PROJECT, SAMPLE_PROJECT } from '../src/data/constants';

const CURRENT = 'gerceklik_oyunu_current_v1_beta';
afterEach(() => { cleanup(); localStorage.clear(); });
const boardNodes = (view: ReturnType<typeof render>) => [...view.container.querySelectorAll('[data-item-id]')];
function clickItem(node: Element, options = {}) {
  fireEvent.mouseDown(node, { button: 0, clientX: 100, clientY: 100, ...options });
  fireEvent.mouseUp(node, options);
  fireEvent.click(node, { detail: 1, ...options });
}
function seed() { localStorage.setItem(CURRENT, JSON.stringify({ ...BASIC_STARTER_PROJECT, projectName: 'Test' })); }
function openProject(view: ReturnType<typeof render>) { fireEvent.click(view.getByTitle('Proje Yükle, Kaydet, JSON ve Şablonlar')); }

test('Shift selection survives the full mouse sequence; arrow deletion only deletes that arrow', () => {
  seed();
  const view = render(<App />);
  const nodes = boardNodes(view);
  clickItem(nodes[0]);
  clickItem(nodes[1], { shiftKey: true });
  assert.ok(view.getByText('2 Öğe Birden Seçildi'));
  assert.equal((view.getByTitle('Geri Al (Ctrl+Z)') as HTMLButtonElement).disabled, true);
  fireEvent.click(view.getByTitle('Ok bağlama modu: Seçili kart(lar)dan hedef karta ok bağlar'));
  clickItem(nodes[2]);
  const arrows = view.getAllByTitle('Bağlantıyı Sil');
  assert.equal(arrows.length, BASIC_STARTER_PROJECT.edges.length + 1);
  clickItem(nodes[0]);
  fireEvent.click(arrows[0]);
  assert.equal(boardNodes(view).length, nodes.length);
  assert.equal(view.getAllByTitle('Bağlantıyı Sil').length, arrows.length - 1);
});

test('release outside stops dragging; undo and redo restore exactly one move', () => {
  seed();
  const view = render(<App />);
  const node = boardNodes(view)[0];
  const before = node.getAttribute('transform');
  const stage = view.container.querySelector('[data-board]')!.parentElement!;
  fireEvent.mouseDown(node, { button: 0, clientX: 100, clientY: 100 });
  fireEvent.mouseMove(stage, { clientX: 140, clientY: 130 });
  fireEvent.mouseUp(window);
  const moved = node.getAttribute('transform');
  assert.notEqual(moved, before);
  fireEvent.mouseMove(stage, { clientX: 200, clientY: 200 });
  assert.equal(node.getAttribute('transform'), moved);
  fireEvent.click(view.getByTitle('Geri Al (Ctrl+Z)'));
  assert.equal(node.getAttribute('transform'), before);
  fireEvent.click(view.getByTitle('İleri Al (Ctrl+Y)'));
  assert.equal(node.getAttribute('transform'), moved);
});

test('group drag keeps selection and all item offsets, with one undo', () => {
  seed(); const view = render(<App />); const nodes = boardNodes(view);
  const initial = nodes.slice(0,2).map(node => node.getAttribute('transform'));
  clickItem(nodes[0]); clickItem(nodes[1], { shiftKey: true });
  const stage = view.container.querySelector('[data-board]')!.parentElement!;
  fireEvent.mouseDown(nodes[0], { button: 0, clientX: 100, clientY: 100 });
  fireEvent.mouseMove(stage, { clientX: 130, clientY: 120 });
  fireEvent.mouseMove(stage, { clientX: 150, clientY: 140 });
  fireEvent.mouseUp(nodes[0]); fireEvent.click(nodes[0], { detail: 1 });
  assert.ok(view.getByText('2 Öğe Birden Seçildi'));
  for (let i=0; i<2; i++) assert.equal(nodes[i].getAttribute('transform'), `translate(${BASIC_STARTER_PROJECT.items[i].x+50}, ${BASIC_STARTER_PROJECT.items[i].y+40})`);
  fireEvent.click(view.getByTitle('Geri Al (Ctrl+Z)'));
  assert.deepEqual(nodes.slice(0,2).map(node => node.getAttribute('transform')), initial);
});

test('dialogs and editable controls protect the board from Delete and Undo shortcuts', () => {
  seed(); const view = render(<App />); const nodes = boardNodes(view);
  clickItem(nodes[0]); openProject(view);
  fireEvent.keyDown(window, { key: 'Delete' });
  assert.equal(boardNodes(view).length, nodes.length);
  fireEvent.click(view.getByLabelText('Proje penceresini kapat'));
  const input = view.container.querySelector('input')!;
  fireEvent.keyDown(input, { key: 'Backspace' });
  assert.equal(boardNodes(view).length, nodes.length);
  fireEvent.keyDown(window, { key: 'Delete' });
  assert.equal(boardNodes(view).length, nodes.length - 1);
});

test('corrupt browser data cannot crash the board', () => {
  localStorage.setItem(CURRENT, '{"items":[null],"edges":true}');
  localStorage.setItem('gerceklik_oyunu_saved_projects_v1_beta', '{"bad":true}');
  const view = render(<App />);
  assert.equal(boardNodes(view).length, BASIC_STARTER_PROJECT.items.length);
  act(() => { window.dispatchEvent(new Event('pagehide')); });
  assert.equal(localStorage.getItem(CURRENT), '{"items":[null],"edges":true}');
  openProject(view);
  assert.ok(view.getByText('Proje & Dosya Yöneticisi'));
});

test('failed storage writes show an error instead of reporting a saved project', () => {
  seed(); const view = render(<App />); openProject(view);
  const original = window.Storage.prototype.setItem;
  window.Storage.prototype.setItem = () => { throw new Error('quota'); };
  try {
    fireEvent.change(view.getByPlaceholderText('Proje adı...'), { target: { value: 'Unsaved' } });
    fireEvent.click(view.getByText('Kaydet', { exact: true }));
    assert.ok(view.getByText('Proje kaydedilemedi. Haritanızı JSON olarak dışa aktarın.'));
    assert.equal(view.queryByText('"Unsaved" kaydedildi!'), null);
  } finally { window.Storage.prototype.setItem = original; }
});

test('JSON rejection preserves the map; valid import, project name and undo work together', async () => {
  seed(); const view = render(<App />);
  const upload = (data: unknown) => {
    openProject(view); fireEvent.click(view.getByText('JSON Aktarım'));
    const input = view.container.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [new File([JSON.stringify(data)], 'map.json', { type: 'application/json' })] } });
  };
  upload({ items: [null] });
  await waitFor(() => assert.ok(view.getByText('Geçersiz harita JSON dosyası')));
  assert.equal(boardNodes(view).length, BASIC_STARTER_PROJECT.items.length);
  upload({ ...SAMPLE_PROJECT, name: 'Imported map' });
  await waitFor(() => assert.equal(boardNodes(view).length, SAMPLE_PROJECT.items.length));
  openProject(view); fireEvent.click(view.getByText('Proje Kaydet / Yükle'));
  assert.equal((view.getByPlaceholderText('Proje adı...') as HTMLInputElement).value, 'Imported map');
  fireEvent.click(view.getByLabelText('Proje penceresini kapat'));
  fireEvent.click(view.getByTitle('Geri Al (Ctrl+Z)'));
  assert.equal(boardNodes(view).length, BASIC_STARTER_PROJECT.items.length);
  openProject(view);
  assert.equal((view.getByPlaceholderText('Proje adı...') as HTMLInputElement).value, 'Test');
});

test('autosave flushes the latest board on page exit before debounce expires', () => {
  seed(); const view = render(<App />);
  clickItem(boardNodes(view)[0]); fireEvent.keyDown(window, { key: 'Delete' });
  act(() => { window.dispatchEvent(new Event('pagehide')); });
  assert.equal(JSON.parse(localStorage.getItem(CURRENT)!).items.length, BASIC_STARTER_PROJECT.items.length - 1);
});


test('pinch starting over an item ends its drag and only changes zoom', () => {
  seed(); const view = render(<App />); const node = boardNodes(view)[0];
  const stage = view.container.querySelector('[data-board]')!.parentElement!;
  const before = node.getAttribute('transform');
  const touch = (x: number, y: number) => ({ clientX: x, clientY: y, identifier: x });
  fireEvent.touchStart(node, { touches: [touch(100,100)] });
  fireEvent.touchStart(node, { touches: [touch(100,100), touch(200,100)] });
  fireEvent.touchMove(stage, { touches: [touch(100,100), touch(250,100)] });
  assert.equal(node.getAttribute('transform'), before);
  assert.ok(view.getByText('150%'));
  fireEvent.touchEnd(stage, { touches: [] });
  assert.equal((view.getByTitle('Geri Al (Ctrl+Z)') as HTMLButtonElement).disabled, true);
});

test('right click does not select or move items; keyboard activation still works', () => {
  seed(); const view = render(<App />); const node = boardNodes(view)[0];
  const before = node.getAttribute('transform');
  const stage = view.container.querySelector('[data-board]')!.parentElement!;
  fireEvent.mouseDown(node, { button: 2, clientX: 100, clientY: 100 });
  fireEvent.mouseMove(stage, { clientX: 150, clientY: 150 });
  fireEvent.mouseUp(window);
  assert.equal(node.getAttribute('transform'), before);
  fireEvent.keyDown(window, { key: 'Delete' });
  assert.equal(boardNodes(view).length, BASIC_STARTER_PROJECT.items.length);
  fireEvent.keyDown(node, { key: 'Enter' });
  fireEvent.keyDown(window, { key: 'Delete' });
  assert.equal(boardNodes(view).length, BASIC_STARTER_PROJECT.items.length - 1);
});


test('wheel gestures prevent browser zoom and keep board zoom in bounds', () => {
  seed(); const view = render(<App />);
  const stage = view.container.querySelector('[data-board]')!.parentElement!;
  assert.equal(fireEvent.keyDown(view.getByTitle('Kılavuz ve Kurallar'), { key: ' ', code: 'Space' }), true);
  assert.equal(fireEvent.wheel(stage, { ctrlKey: true, deltaY: -100 }), false);
  assert.ok(view.getByText('110%'));
  for (let i = 0; i < 30; i++) fireEvent.wheel(stage, { ctrlKey: true, deltaY: -100 });
  assert.ok(view.getByText('300%'));
});
