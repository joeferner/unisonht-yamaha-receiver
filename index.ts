import {UnisonHT, Device, UnisonHTResponse} from "unisonht";
import * as express from "express";
import * as xpath from "xpath";
import * as xmldom from "xmldom";
import * as http from "http";
import * as Boom from "boom";

export class YamahaReceiver extends Device {
  constructor(name: string, options: YamahaReceiver.Options) {
    super(name, options);
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
    const newInput = this.getOptions().inputs[input];
    if (newInput) {
      input = newInput;
    }
    res.promiseNoContent(this.changeInputOfZone(YamahaReceiver.Zone.MAIN, input));
  }

  private changeInputOfZone(zone: string, input: string): Promise<Document> {
    const command = `<YAMAHA_AV cmd="PUT"><${zone}><Input><Input_Sel>${input}</Input_Sel></Input></${zone}></YAMAHA_AV>`;
    return this.sendXMLToReceiver(command);
  }

  protected handleButtonPress(req: express.Request, res: UnisonHTResponse, next: express.NextFunction): void {
    const buttonName = req.query.buttonName;
    switch (buttonName.toUpperCase()) {
      case 'MUTE':
        res.promiseNoContent(this.toggleMute(YamahaReceiver.Zone.MAIN));
        return;
      case 'VOLUMEUP':
        res.promiseNoContent(this.changeVolume(YamahaReceiver.Zone.MAIN, 0.5));
        return;
      case 'VOLUMEDOWN':
        res.promiseNoContent(this.changeVolume(YamahaReceiver.Zone.MAIN, -0.5));
        return;
      default:
        next(Boom.badRequest(`Invalid button name: ${buttonName}`));
        return;
    }
  }

  handleOn(req: express.Request, res: UnisonHTResponse, next: express.NextFunction): void {
    res.promiseNoContent(
      this.putXml(YamahaReceiver.Zone.MAIN, "<Power_Control><Power>On</Power></Power_Control>")
    );
  }

  handleOff(req: express.Request, res: UnisonHTResponse, next: express.NextFunction): void {
    res.promiseNoContent(
      this.putXml(YamahaReceiver.Zone.MAIN, "<Power_Control><Power>Standby</Power></Power_Control>")
    );
  }

  private toggleMute(zone: string): Promise<void> {
    return this.isMuted(zone)
      .then((muted) => {
        if (muted) {
          return this.muteOff(zone);
        } else {
          return this.muteOn(zone);
        }
      });
  }

  private isMuted(zone: string): Promise<boolean> {
    return this.isStatusParamOn(zone, 'Mute');
  }

  private muteOff(zone: string): Promise<void> {
    return this.putXml(zone, '<Volume><Mute>Off</Mute></Volume>').then(() => {
    });
  }

  private muteOn(zone: string): Promise<void> {
    return this.putXml(zone, '<Volume><Mute>On</Mute></Volume>').then(() => {
    });
  }

  private changeVolume(zone: string, delta: number): Promise<void> {
    const direction = delta > 0 ? "Up" : "Down";
    const amount = Math.abs(delta) == 0.5 ? '' : ` ${Math.abs(delta)} dB `;
    const xml = `<Volume><Lvl><Val>${direction}${amount}</Val><Exp></Exp><Unit></Unit></Lvl></Volume>`;
    return this.putXml(zone, xml).then(() => {
    });
  }

  private isStatusParamOn(zone: string, param: string): Promise<boolean> {
    return this.getStatusString(zone, param)
      .then((statusString) => {
        return statusString.toUpperCase() == 'ON';
      });
  }

  private putXml(zone: string, content: string): Promise<Document> {
    const command = `<YAMAHA_AV cmd="PUT"><${zone}>${content}</${zone}></YAMAHA_AV>`;
    return this.sendXMLToReceiver(command);
  }

  private getXml(zone: string, content: string): Promise<Document> {
    const command = `<YAMAHA_AV cmd="GET"><${zone}>${content}</${zone}></YAMAHA_AV>`;
    return this.sendXMLToReceiver(command);
  }

  getBasicStatus(zone: string): Promise<Document> {
    return this.getXml(zone, '<Basic_Status>GetParam</Basic_Status>');
  }

  getStatusString(zone: string, param: string): Promise<string> {
    return this.getBasicStatus(zone)
      .then((statusXml) => {
        return new Promise((resolve, reject) => {
          return resolve(xpath.select(`//${param}/text()`, statusXml).toString());
        });
      });
  }

  private sendXMLToReceiver(command: string): Promise<Document> {
    return new Promise((resolve, reject) => {
      let responseData = '';
      const options = {
        hostname: this.getOptions().address,
        port: 80,
        path: '/YamahaRemoteControl/ctrl',
        method: 'POST',
        headers: {
          'Connection': 'close',
          'Content-Type': 'text/xml; charset=utf-8',
          'Content-Length': Buffer.byteLength(command)
        }
      };
      const req = http.request(options, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          try {
            this.log.debug(`responseData ${responseData}`);
            resolve(new xmldom.DOMParser().parseFromString(responseData));
          } catch (err) {
            reject(err);
          }
        });
      });
      req.on('error', (e) => {
        reject(`problem with request: ${e.message}`);
      });
      this.log.debug(`sending command ${command}`);
      req.write(command);
      req.end();
    });
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
