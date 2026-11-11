// Manifold's pinned Emscripten build generates JS invokers at runtime.
// Use equivalent closures in Workers, where dynamic evaluation is unavailable.
const boundInvoker = `function createJsInvoker(argTypes, isMethod, returns, isAsync) {
  if (isAsync) throw new Error('Asynchronous manifold bindings are unsupported');
  const usesStack = usesDestructorStack(argTypes);
  return (name, fail, invoke, target, destroy, fromWire, toThis, ...converters) => {
    const inputCount = argTypes.length - 2;
    const releaseIndices = argTypes.slice(isMethod ? 1 : 2).flatMap((type, i) => type.destructorFunction !== null ? [i] : []);
    const destructors = converters.slice(inputCount);
    return function (...args) {
      const stack = usesStack ? [] : null;
      const wired = converters.slice(0, inputCount).map((convert, i) => convert(stack, args[i]));
      if (isMethod) wired.unshift(toThis(stack, this));
      const result = invoke(target, ...wired);
      if (usesStack) destroy(stack);
      else destructors.forEach((release, i) => release(wired[releaseIndices[i]]));
      if (returns) return fromWire(result);
    };
  };
}`;
const valueInvoker = `var __emval_create_invoker = function (count, typePointer, kind) {
  const [resultType, ...inputs] = emval_lookupTypes(count, typePointer >>> 0);
  const toWire = resultType.toWireType.bind(resultType);
  return emval_addMethodCaller((handle, method, destructorRef, pointer) => {
    const args = inputs.map((type, index) => type.readValueFromPointer(pointer + index * 8));
    const value = kind === 3 ? undefined : Emval.toValue(handle);
    let result;
    if (kind === 0) result = value(...args);
    else if (kind === 1) result = value[getStringOrSymbol(method)](...args);
    else if (kind === 2) result = new value(...args);
    else if (kind === 3) result = args[0];
    else throw new Error('Unknown manifold binding type');
    return resultType.isVoid ? undefined : emval_returnValue(toWire, destructorRef, result);
  });
};`;

export function manifoldWorker() {
  return {
    name: 'manifold-worker',
    enforce: 'pre',
    transform(source, id) {
      if (!id.split('?')[0].endsWith('/manifold-3d/manifold.js')) return;
      const bound = /function createJsInvoker\([\s\S]*?(?=function craftInvokerFunction)/;
      const value = /var __emval_create_invoker=[\s\S]*?(?=function __emval_equals)/;
      const nodeRuntime = /var ENVIRONMENT_IS_NODE=[^;]+;/;
      if (!bound.test(source) || !value.test(source) || !nodeRuntime.test(source)) throw new Error('Manifold bindings changed; review Worker compatibility');
      // nodejs_compat exposes process, but the Worker has no Node filesystem.
      return source.replace(nodeRuntime, 'var ENVIRONMENT_IS_NODE=false;')
        .replace(bound, boundInvoker).replace(value, valueInvoker);
    },
  };
}
