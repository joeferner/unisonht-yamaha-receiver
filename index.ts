import {Device, DeviceOptions} from "unisonht/lib/Device";

interface YamahaReceiverOptions extends DeviceOptions {
  address: string;
  inputs: {
    [deviceInputName: string];
  }
}

export default class YamahaReceiver extends Device {
  constructor(options: YamahaReceiverOptionsOptions) {
    super(options);
  }
}