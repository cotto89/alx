/*
* https://github.com/Microsoft/TypeScript/issues/5073

* import * as merge from 'lodash.merge'
* or
* import merge = requre('lodash.merge')
*/
declare module "lodash.merge" {
    function merge(target: any, ...src: any[]): any
    namespace merge { } // import * as merge from ...を可能にする
    export = merge
}
