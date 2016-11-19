/// <reference path="./index.d.ts" />

import {UnisonHTDevice} from "unisonht";
import * as xpath from "xpath";
import * as xmldom from "xmldom";
import * as http from "http";
import createLogger from "unisonht/lib/Log";

const log = createLogger('yamahaReceiver');

class YamahaReceiver implements UnisonHTDevice {
  private options: YamahaReceiver.Options;

  constructor(options: YamahaReceiver.Options) {
    this.options = options;
  }

  getName(): string {
    return this.options.name;
  }

  changeInput(input: string): Promise<void> {
    const newInput = this.options.inputs[input];
    if (newInput) {
      input = newInput;
    }
    return this.changeInputOfZone(YamahaReceiver.Zone.MAIN, input);
  }

  private changeInputOfZone(zone: string, input: string): Promise<Document> {
    const command = `<YAMAHA_AV cmd="PUT"><${zone}><Input><Input_Sel>${input}</Input_Sel></Input></${zone}></YAMAHA_AV>`;
    return this.sendXMLToReceiver(command);
  }

  buttonPress(button: string): Promise<void> {
    switch (button.toUpperCase()) {
      case 'MUTE':
        return this.toggleMute(YamahaReceiver.Zone.MAIN);
      case 'VOLUMEUP':
        return this.changeVolume(YamahaReceiver.Zone.MAIN, 0.5);
      case 'VOLUMEDOWN':
        return this.changeVolume(YamahaReceiver.Zone.MAIN, -0.5);
      default:
        return Promise.reject(new Error(`Invalid button name: ${button}`));
    }
  }

  ensureOn(): Promise<void> {
    return this.putXml(YamahaReceiver.Zone.MAIN, "<Power_Control><Power>On</Power></Power_Control>");
  }

  ensureOff(): Promise<void> {
    return this.putXml(YamahaReceiver.Zone.MAIN, "<Power_Control><Power>Standby</Power></Power_Control>");
  }

  private toggleMute(zone: string): Promise<void> {
    return this.isMuted(zone)
      .then((muted)=> {
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
    return this.putXml(zone, '<Volume><Mute>Off</Mute></Volume>');
  }

  private muteOn(zone: string): Promise<void> {
    return this.putXml(zone, '<Volume><Mute>On</Mute></Volume>');
  }

  private changeVolume(zone: string, delta: number): Promise<void> {
    const direction = delta > 0 ? "Up" : "Down";
    const amount = Math.abs(delta) == 0.5 ? '' : ` ${Math.abs(delta)} dB `;
    const xml = `<Volume><Lvl><Val>${direction}${amount}</Val><Exp></Exp><Unit></Unit></Lvl></Volume>`;
    return this.putXml(zone, xml);
  }

  private isStatusParamOn(zone: string, param: string): Promise<string> {
    return this.getStatusString(zone, param)
      .then((statusString)=> {
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
      .then((statusXml)=> {
        return new Promise((resolve, reject)=> {
          return resolve(xpath.select(`//${param}/text()`, statusXml).toString());
        });
      });
  }

  private sendXMLToReceiver(command: string): Promise<Document> {
    return new Promise((resolve, reject)=> {
      var responseData = '';
      const options = {
        hostname: this.options.address,
        port: 80,
        path: '/YamahaRemoteControl/ctrl',
        method: 'POST',
        headers: {
          'Connection': 'close',
          'Content-Type': 'text/xml; charset=utf-8',
          'Content-Length': Buffer.byteLength(command)
        }
      };
      const req = http.request(options, (res)=> {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          try {
            resolve(new xmldom.DOMParser().parseFromString(responseData));
          } catch (err) {
            reject(err);
          }
        });
      });
      req.on('error', (e) => {
        reject(`problem with request: ${e.message}`);
      });
      log.debug(`sending command ${command}`);
      req.write(command);
      req.end();
    });
  }
}

module YamahaReceiver {
  export interface Options {
    name: string;
    address: string;
    inputs: {
      [deviceInputName: string]: string;
    }
  }

  export class Zone {
    static get MAIN() {
      return 'Main_Zone';
    }
  }
}

export default YamahaReceiver;
