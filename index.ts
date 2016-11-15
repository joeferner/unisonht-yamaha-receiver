import {Device, DeviceOptions} from "unisonht/lib/Device";

interface YamahaReceiverOptions extends DeviceOptions {
  address: string;
  inputs: {
    [deviceInputName: string]: string;
  }
}

export default class YamahaReceiver extends Device {
  constructor(options: YamahaReceiverOptions) {
    super(options);
  }
}