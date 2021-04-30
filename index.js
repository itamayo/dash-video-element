import CustomVideoElement from 'custom-video-element';

// This doesn't work currently because of dependency issues in dash.js
// Instead we're just concatenating dash.js into the file and adding to the window.
// import * as dashjs from 'dashjs';

class DASHVideoElement extends CustomVideoElement {

  constructor() {
    super();
  }

  get src() {
    // Use the attribute value as the source of truth.
    // No need to store it in two places.
    // This avoids needing a to read the attribute initially and update the src.
    return this.getAttribute('src');
  }

  set src(val) {
    // If being set by attributeChangedCallback,
    // dont' cause an infinite loop
    if (val !== this.src) {
      this.setAttribute('src', val);
    }
    if (this.dashPlayer) {
      let opt = this.getAttribute('options');
      opt = JSON.parse(opt);
      this.dashPlayer.updateSettings({
        'streaming': {
          'stableBufferTime': opt.stableBuffer,
          'bufferTimeAtTopQualityLongForm': opt.bufferAtTopQuality,
          'abr': {
            'minBitrate': {
              'video': opt.minBitrate
            },
            'maxBitrate': {
              'video': opt.maxBitrate
            },
            'limitBitrateByPortal': opt.limitByPortal
          }
        }
      })

    }
  }
  get options() {
    // Use the attribute value as the source of truth.
    // No need to store it in two places.
    // This avoids needing a to read the attribute initially and update the src.
    return this.getAttribute('options');
  }

  set options(val) {
    // If being set by attributeChangedCallback,
    // dont' cause an infinite loop
    if (val !== this.options) {
      this.setAttribute('options', val);
      if (this.dashPlayer) {
        let opt = val;
        opt = JSON.parse(opt);
        this.dashPlayer.updateSettings({
          'streaming': {
            'stableBufferTime': opt.stableBuffer,
            'bufferTimeAtTopQualityLongForm': opt.bufferAtTopQuality,
            'abr': {
              'minBitrate': {
                'video': opt.minBitrate
              },
              'maxBitrate': {
                'video': opt.maxBitrate
              },
              'limitBitrateByPortal': opt.limitByPortal
            }
          }
        })

      }

    }
  }

  get autoplay() {
    return this.getAttribute('autoplay');

  }
  set autoplay(val) {
    if (val !== this.autoplay) {
      this.setAttribute('autoplay', val);
    }

  }
  get log() {
    return this.getAttribute('autoplay');

  }
  set log(val) {
    if (val !== this.log) {
     
      if (val=="true"){
        if (val && val=="true" && eventPoller!=-1){
          this.renderHTML();
          var eventPoller = setInterval( ()=> {
            if (this.dashPlayer.getActiveStream()){
            var streamInfo = this.dashPlayer.getActiveStream().getStreamInfo();
            var dashMetrics = this.dashPlayer.getDashMetrics();
            var dashAdapter = this.dashPlayer.getDashAdapter();
  
            if (dashMetrics && streamInfo) {
              const periodIdx = streamInfo.index;
              var repSwitch = dashMetrics.getCurrentRepresentationSwitch('video', true);
              var bufferLevel = dashMetrics.getCurrentBufferLevel('video', true);
              var bitrate = repSwitch ? Math.round(dashAdapter.getBandwidthForRepresentation(repSwitch.to, periodIdx) / 1000) : NaN;
              var adaptation = dashAdapter.getAdaptationForType(periodIdx, 'video', streamInfo)
              var frameRate = adaptation.Representation_asArray.find(function (rep) {
                return rep.id === repSwitch.to
              }).frameRate;
              this.shadowRoot.querySelector('#bufferLevel').innerText = bufferLevel + " secs";
              this.shadowRoot.querySelector('#framerate').innerText = frameRate + " fps";
              this.shadowRoot.querySelector('#reportedBitrate').innerText = bitrate + " Kbps";
            }
          }
          }, 6000);
        }
      }
      else {
        clearInterval(eventPoller);
      }
      //this.log= val;
    }

  }
  updateOptions() {
    if (this.dashPlayer) {
      let opt = this.getAttribute('options');
      opt = JSON.parse(opt);
      this.dashPlayer.updateSettings({
        'streaming': {
          'stableBufferTime': opt.stableBuffer,
          'bufferTimeAtTopQualityLongForm': opt.bufferAtTopQuality,
          'abr': {
            'minBitrate': {
              'video': opt.minBitrate
            },
            'maxBitrate': {
              'video': opt.maxBitrate
            },
            'limitBitrateByPortal': opt.limitByPortal
          }
        }
      })

    }
  }
  load() {
    this.dashPlayer = window.dashjs.MediaPlayer().create();
    this.dashPlayer.initialize(this.nativeEl, this.src, this.getAttribute('autoplay') == "true");
    let opt = this.getAttribute('options');
    opt = JSON.parse(opt);
    this.dashPlayer.updateSettings({
      'streaming': {
        'stableBufferTime': opt.stableBuffer,
        'bufferTimeAtTopQualityLongForm': opt.bufferAtTopQuality,
        'abr': {
          'minBitrate': {
            'video': opt.minBitrate
          },
          'maxBitrate': {
            'video': opt.maxBitrate
          },
          'limitBitrateByPortal': opt.limitByPortal
        }
      }
    })


  }
  renderHTML() {
    let div = document.createElement('div');
    div.style = "position:absolute;top:15px;left:15px;color:red";
    div.innerHTML=`
      <span id="bufferLevel"></span>
      <span id="framerate"></span>
      <span id="reportedBitrate"></span>
      `;
    this.shadowRoot.appendChild(div);
  }

  connectedCallback() {
     
    this.load();
   
   
     
    

    // Not preloading might require faking the play() promise
    // so that you can call play(), call load() within that
    // But wait until MANIFEST_PARSED to actually call play()
    // on the nativeEl.
    // if (this.preload === 'auto') {
    //   this.load();
    // }
  }
}

if (!window.customElements.get('dash-video')) {
  window.customElements.define('dash-video', DASHVideoElement);
  window.DASHVideoElement = DASHVideoElement;
}

export { DASHVideoElement };
