// GitHub Pages: upload this folder as-is. No browser API key is required.
// To use a private OpenAI-enabled backend, set serverUrl and allow this Pages origin on that server.
window.APT_CONFIG={
  serverUrl:'',
  mode:'auto', // 'auto': Node when available, relay on static hosting. 'local': solo only.
  relays:['wss://broker.emqx.io:8084/mqtt','wss://broker.hivemq.com:8884/mqtt','wss://test.mosquitto.org:8081/mqtt'],
  worldId:'pureun-v4'
};
