import test from "ava";
import { compose, Dispatcher, UseCase } from "../index";

test("distribute module", (t) => {
    t.is(Dispatcher.name, "Dispatcher");
    t.is(UseCase.name, "UseCase");
    t.is(compose.name, "compose");
});
