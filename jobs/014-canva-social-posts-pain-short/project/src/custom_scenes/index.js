// Per-job custom scene registry (render_guide.md "Custom per-job scenes"). A job that needs a bespoke
// one-off component (not worth adding to the shared REGISTRY in Doc.jsx) drops its .jsx file next to
// this one and re-exports it here, keyed by the `visual.type` string scenes.json will use:
//
//   import {MyBespokeScene} from './MyBespokeScene.jsx';
//   export default {mybespokescene: MyBespokeScene};
//
// render.yml's "refresh engine" step excludes this whole folder from the template sync, so a job's own
// custom_scenes/ survives every re-render untouched. The default export below (empty object) is what
// ships in the template itself and in any job that hasn't written a custom scene — Doc.jsx always
// imports this file, so it must always exist and always default-export an object (never throw).
export default {};
