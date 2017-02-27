import {UnisonHT, Device, UnisonHTResponse} from "unisonht";
import * as express from "express";
import {YamahaReceiverClient} from "./YamahaReceiverClient";
import {MockYamahaReceiverClient} from "./MockYamahaReceiverClient";
import {YamahaReceiverClientImpl} from "./YamahaReceiverClientImpl";
import * as Boom from "boom";

export class YamahaReceiver extends Device {
  private client: YamahaReceiverClient;

  constructor(name: string, options: YamahaReceiver.Options) {
    super(name, options);
    this.client = process.env.NODE_ENV === 'development'
      ? new MockYamahaReceiverClient()
      : new YamahaReceiverClientImpl(
        options.address,
        options.inputs
      );
  }

  public getStatus(): Promise<YamahaReceiver.Status> {
    // TODO
    return Promise.resolve({});
  }

  start(unisonht: UnisonHT): Promise<void> {
    return super.start(unisonht)
      .then(() => {
        unisonht.getApp().post(`${this.getPathPrefix()}/on`, this.handleOn.bind(this));
        unisonht.getApp().post(`${this.getPathPrefix()}/off`, this.handleOff.bind(this));
        unisonht.getApp().post(`${this.getPathPrefix()}/input`, this.handleChangeInput.bind(this));
      });
  }

  private handleChangeInput(req: express.Request, res: UnisonHTResponse, next: express.NextFunction): void {
    let input = req.query.input;
    res.promiseNoContent(this.client.changeInput(input));
  }

  protected handleButtonPress(req: express.Request, res: UnisonHTResponse, next: express.NextFunction): void {
    const buttonName = req.query.button;
    if (!buttonName) {
      return next(Boom.badRequest('missing "button" query parameter'));
    }
    res.promiseNoContent(this.client.buttonPress(buttonName));
  }

  handleOn(req: express.Request, res: UnisonHTResponse, next: express.NextFunction): void {
    res.promiseNoContent(this.client.on());
  }

  handleOff(req: express.Request, res: UnisonHTResponse, next: express.NextFunction): void {
    res.promiseNoContent(this.client.off());
  }

  public getOptions(): YamahaReceiver.Options {
    return <YamahaReceiver.Options>super.getOptions();
  }
}

export module YamahaReceiver {
  export interface Options extends Device.Options {
    address: string;
    inputs: {
      [deviceInputName: string]: string;
    }
  }

  export interface Status extends Device.Status {

  }

  export class Zone {
    static get MAIN() {
      return 'Main_Zone';
    }
  }
}
