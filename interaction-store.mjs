export async function compressInteractionLog(log) {
  const source = new Blob([JSON.stringify(log)], {type: 'application/json'});
  const compressed = source.stream().pipeThrough(new CompressionStream('gzip'));
  return new Response(compressed).arrayBuffer();
}

export async function decompressInteractionLog(gzipJson) {
  const source = new Blob([gzipJson]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(source).json();
}
