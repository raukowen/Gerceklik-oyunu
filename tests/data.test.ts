import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BASIC_STARTER_PROJECT, SAMPLE_PROJECT } from '../src/data/constants';
import { parseBoard, isProject } from '../src/utils/projectData';
import { recordSnapshot, HISTORY_LIMIT, HistoryState } from '../src/utils/history';

test('both existing templates and legacy exports remain valid', () => {
  for (const project of [BASIC_STARTER_PROJECT, SAMPLE_PROJECT]) {
    assert.equal(isProject(project), true);
    assert.ok(parseBoard(JSON.parse(JSON.stringify(project))));
    assert.ok(parseBoard({ items: project.items }));
  }
  assert.ok(parseBoard({ items: [], edges: [] }));
});

test('reject malformed items, invalid rules, duplicate IDs and broken connections', () => {
  const item = BASIC_STARTER_PROJECT.items[0];
  for (const value of [null, {}, { items: true }, { items: [null] }, { items: [item, item] },
    ...[{ x: Infinity }, { width: -2 }, { frameStatus: '__proto__' }, { size: 'invalid' }, { ringType: 'invalid' }, { title: {} }].map(change => ({ items: [{ ...item, ...change }] })),
    { items: [item], edges: [{ id: 'broken', fromId: item.id, toId: 'missing' }] },
    { items: [item], edges: {} }]) assert.equal(parseBoard(value), null);
});

test('history ignores no-op clicks, restores names, truncates redo branches and bounds memory', () => {
  const initial = { ...BASIC_STARTER_PROJECT, projectName: 'First' };
  let state: HistoryState = { entries: [initial], index: 0 };
  assert.equal(recordSnapshot(state, { ...initial, items: initial.items.map(item => ({ ...item })) }), state);
  state = recordSnapshot(state, { ...initial, projectName: 'Second' });
  assert.equal(state.entries[0].projectName, 'First');
  state = recordSnapshot({ ...state, index: 0 }, { ...initial, projectName: 'Branch' });
  assert.equal(state.entries.length, 2);
  assert.equal(state.entries[1].projectName, 'Branch');
  for (let i = 0; i < 150; i++) state = recordSnapshot(state, { ...initial, projectName: `Project ${i}` });
  assert.equal(state.entries.length, HISTORY_LIMIT);
  assert.equal(state.index, HISTORY_LIMIT - 1);
  assert.equal(state.entries.at(-1)?.projectName, 'Project 149');
});
