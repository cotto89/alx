import test from "ava";
import { Dispatcher, UseCase } from "../index";

test("distribute module", (t) => {
    t.is(Dispatcher.name, "Dispatcher");
    t.is(UseCase.name, "UseCase");
});
