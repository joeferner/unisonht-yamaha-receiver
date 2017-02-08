import {YamahaReceiverClient} from "./YamahaReceiverClient";
import * as Logger from "bunyan";
import {createLogger} from "../unisonht/lib/Log";

export class MockYamahaReceiverClient implements YamahaReceiverClient {
  private log: Logger;

  constructor() {
    this.log = createLogger('MockYamahaReceiverClient');
  }

  changeInput(input: string): Promise<void> {
    this.log.info(`changeInput ${input}`);
    return Promise.resolve();
  }

  on(): Promise<void> {
    this.log.info('on');
    return Promise.resolve();
  }

  off(): Promise<void> {
    this.log.info('off');
    return Promise.resolve();
  }

  buttonPress(buttonName: string): Promise<void> {
    this.log.info(`buttonPress ${buttonName}`);
    return Promise.resolve();
  }
}