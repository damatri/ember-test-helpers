import { module, test } from 'qunit';
import { focus, setupContext, teardownContext } from '@ember/test-helpers';
import { buildInstrumentedElement } from '../../helpers/events';
import { isIE11 } from '../../helpers/browser-detect';

let focusSteps = ['focus', 'focusin'];

if (isIE11) {
  focusSteps = ['focusin', 'focus'];
}

module('DOM Helper: focus', function(hooks) {
  let context, element;

  hooks.beforeEach(function() {
    context = {};
  });

  hooks.afterEach(async function() {
    if (element) {
      element.parentNode.removeChild(element);
    }
    // only teardown if setupContext was called
    if (context.owner) {
      await teardownContext(context);
    }
    document.getElementById('ember-testing').innerHTML = '';
  });

  test('focusing a div via selector with context set', async function(assert) {
    element = buildInstrumentedElement('div');

    await setupContext(context);
    assert.rejects(() => {
      return focus(`#${element.id}`);
    }, /is not focusable/);
  });

  test('focusing a div via element with context set', async function(assert) {
    element = buildInstrumentedElement('div');

    await setupContext(context);
    assert.rejects(() => {
      return focus(element);
    }, /is not focusable/);
  });

  test('does not run sync', async function(assert) {
    element = buildInstrumentedElement('input');

    let promise = focus(element);

    assert.verifySteps([]);

    await promise;

    assert.verifySteps(focusSteps);
  });

  test('rejects if selector is not found', async function(assert) {
    element = buildInstrumentedElement('div');

    await setupContext(context);

    assert.rejects(() => {
      return focus(`#foo-bar-baz-not-here-ever-bye-bye`);
    }, /Element not found when calling `focus\('#foo-bar-baz-not-here-ever-bye-bye'\)`/);
  });

  test('focusing a input via selector with context set', async function(assert) {
    element = buildInstrumentedElement('input');

    await setupContext(context);
    await focus(`#${element.id}`);

    assert.verifySteps(focusSteps);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
  });

  test('focusing a input via element with context set', async function(assert) {
    element = buildInstrumentedElement('input');

    await setupContext(context);
    await focus(element);

    assert.verifySteps(focusSteps);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
  });

  test('focusing a input via element without context set', async function(assert) {
    element = buildInstrumentedElement('input');

    await focus(element);

    assert.verifySteps(focusSteps);
    assert.strictEqual(document.activeElement, element, 'activeElement updated');
  });

  test('focusing a input via selector without context set', async function(assert) {
    element = buildInstrumentedElement('input');

    assert.rejects(() => {
      return focus(`#${element.id}`);
    }, /Must setup rendering context before attempting to interact with elements/);
  });
});
