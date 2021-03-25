export const SamplerState = {
    stopped: "stopped", // Sampler not running on the server
    waiting: "waiting", // Sampler created on server, waiting for first output
    running: "running", // Sampler generating output
    stopwait: "stopwait" // Sampler waiting to a stop
};

export const GenerationType = {
    continuation: 'continuation',
    prompt: 'prompt'
};