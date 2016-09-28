import test from 'ava';
import { planWithOrder, INCREMENT_COUNT } from './fixtures';
import AlxStore from './../lib/AlxStore';

test('#getStatus', t => {
    const initStatus = {
        counterA: { count: 0 },
        counterB: { count: 0 }
    };
    const store = new AlxStore(initStatus, planWithOrder().plan);

    t.deepEqual(store.getStatus(), {
        counterA: { count: 0 },
        counterB: { count: 0 }
    });

    t.deepEqual(store.getStatus('counterA'), { count: 0 });
});

test('#getActionPlanInfo', t => {
    const initStatus = {
        counterA: { count: 0 },
        counterB: { count: 0 },
        foo: {},
        bar: {}
    };

    const nextFn = () => {};

    const { plan, counterASpy, counterBSpy } = planWithOrder();
    plan.INCREMENT_COUNT.$next = nextFn;
    const store = new AlxStore(initStatus, plan);
    const info = store.getActionPlanInfo(INCREMENT_COUNT);

    t.deepEqual(plan[INCREMENT_COUNT], info.plan);
    t.deepEqual(info.next, nextFn);
    t.deepEqual(info.order, [
        ['foo', undefined],
        ['bar', undefined],
        ['counterB', counterBSpy],
        ['counterA', counterASpy]
    ]);
});
