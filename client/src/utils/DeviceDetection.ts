class DeviceDetection {
  // ----------------------
  // Navigator Utils
  // ----------------------

  get platform() {
    return self.navigator.platform;
  }

  get agent() {
    return self.navigator.userAgent;
  }

  // ----------------------
  // Devices
  // ----------------------

  get iPhone() {
    return (
      this.platform === 'iPhone' ||
      this.platform === 'iPhone Simulator' ||
      this.agent.indexOf('iPhone;') !== -1
    );
  }

  get iPad() {
    return (
      this.platform === 'iPad' ||
      this.platform === 'iPad Simulator' ||
      this.agent.indexOf('iPad;') !== -1
    );
  }

  get Android() {
    return /; Android/.test(this.agent);
  }

  get iOS() {
    return this.iPhone || this.iPad;
  }

  get iOS7() {
    return this.iOS && /; CPU OS 7_/.test(this.agent);
  }

  get iOS8() {
    return this.iOS && /; CPU OS 8_/.test(this.agent);
  }

  // ----------------------
  // Browsers
  // ----------------------

  get isChrome() {
    return /Chrome\//.test(this.agent);
  }

  get isIE() {
    return /\bMSIE\b/.test(this.agent) || /\bTrident\b/.test(this.agent);
  }

  get isSafari() {
    return !this.isChrome && /Safari\//.test(this.agent);
  }

  get isFirefox() {
    return /Firefox\//.test(this.agent);
  }

  // ----------------------
  // Misc
  // ----------------------

  get homeScreenApp() {
    return this.isMobile && (self.navigator as any).standalone;
  }

  // ----------------------
  // Platform
  // ----------------------

  get isMobile() {
    return this.iOS || this.iOS7 || this.iOS8 || this.Android;
  }

  get isCordova() {
    return (
      self.document.URL.indexOf('http://') === -1 &&
      self.document.URL.indexOf('https://') === -1
    );
  }

  get isMac() {
    return self.navigator.platform === 'MacIntel';
  }

  get isDesktop() {
    return !this.isMobile;
  }

  // ----------------------
  // Utils
  // ----------------------

  get className() {
    if (this.isMobile) {
      return 'device-mobile';
    }

    return 'device-desktop';
  }
}

export default new DeviceDetection();
