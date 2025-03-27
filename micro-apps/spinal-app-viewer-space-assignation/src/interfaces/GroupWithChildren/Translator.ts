interface Translator<I, V> {
  translate(item: I, verb: V): {};
}

export { Translator };
