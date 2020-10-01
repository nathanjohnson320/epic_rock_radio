"use strict";

var _icecastParser = require("icecast-parser");

var _querystring = _interopRequireDefault(require("querystring"));

var _http = _interopRequireDefault(require("http"));

var _lame = _interopRequireDefault(require("@suldashi/lame"));

var _wav = _interopRequireDefault(require("wav"));

var _speaker = _interopRequireDefault(require("speaker"));

var _pcmVolume = _interopRequireDefault(require("pcm-volume"));

var _react = _interopRequireWildcard(require("react"));

var _ink = require("ink");

var _inkBigText = _interopRequireDefault(require("ink-big-text"));

var _inkDivider = _interopRequireDefault(require("ink-divider"));

var _image = _interopRequireDefault(require("./image.dist"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const url = 'http://jenny.torontocast.com:8064/stream';
const decoder = new _lame.default.Decoder();
const speaker = new _speaker.default({
  channels: 2,
  bitDepth: 16,
  sampleRate: 44100
});
const vol = new _pcmVolume.default();
const radioStation = new _icecastParser.Parser({
  url,
  notifyOnChangeOnly: true
});

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

const UI = () => {
  const [tmpVol, setTmpVolume] = (0, _react.useState)(0);
  const [v, setVolume] = (0, _react.useState)(1);
  const [meta, setMeta] = (0, _react.useState)({});
  (0, _react.useEffect)(() => {
    radioStation.on('metadata', metadata => {
      let params = _querystring.default.decode(metadata.get('StreamUrl'));

      setMeta(params);
    });

    _http.default.get(url, res => {
      res.pipe(decoder);
    });

    decoder.on('format', format => {
      const writer = new _wav.default.Writer(format);
      vol.setVolume(v);
      decoder.pipe(writer).pipe(vol).pipe(speaker);
    });
    return () => {};
  }, []);
  (0, _react.useEffect)(() => {
    vol.setVolume(v);
  }, [v]);
  (0, _ink.useInput)((input, key) => {
    if (key.downArrow) {
      setVolume(clamp((v - 0.1).toFixed(2)));
    }

    if (key.upArrow) {
      setVolume(clamp((v + 0.1).toFixed(2)));
    }

    if (input === 'q') process.exit(0);

    if (input === ' ') {
      if (tmpVol !== 0) {
        setVolume(tmpVol);
        setTmpVolume(0);
      } else {
        setTmpVolume(v);
        setVolume(0);
      }
    }
  });
  return /*#__PURE__*/_react.default.createElement(_ink.Box, {
    flexDirection: "column"
  }, /*#__PURE__*/_react.default.createElement(_ink.Box, {
    justifyContent: "center"
  }, /*#__PURE__*/_react.default.createElement(_inkBigText.default, {
    text: "Epic Rock Radio"
  })), /*#__PURE__*/_react.default.createElement(_ink.Box, {
    flexDirection: "row",
    justifyContent: "center"
  }, /*#__PURE__*/_react.default.createElement(_ink.Box, {
    borderStyle: "bold",
    width: "20%",
    justifyContent: "center",
    alignItems: "center"
  }, /*#__PURE__*/_react.default.createElement(_image.default, {
    width: "40%",
    src: meta.picture
  })), /*#__PURE__*/_react.default.createElement(_ink.Box, {
    borderStyle: "bold",
    width: "80%",
    flexDirection: "column",
    justifyContent: "center",
    padding: 1
  }, /*#__PURE__*/_react.default.createElement(_inkDivider.default, {
    title: "Now Playing"
  }), /*#__PURE__*/_react.default.createElement(_ink.Newline, null), /*#__PURE__*/_react.default.createElement(_ink.Text, {
    bold: true
  }, meta.title), /*#__PURE__*/_react.default.createElement(_ink.Text, null, meta.artist, " - ", meta.album), /*#__PURE__*/_react.default.createElement(_ink.Newline, null), /*#__PURE__*/_react.default.createElement(_inkDivider.default, {
    title: "Controls"
  }), /*#__PURE__*/_react.default.createElement(_ink.Newline, null), /*#__PURE__*/_react.default.createElement(_ink.Text, null, "(\u2191/\u2193) Volume: ", v), /*#__PURE__*/_react.default.createElement(_ink.Text, null, "(spc) Mute"), /*#__PURE__*/_react.default.createElement(_ink.Text, null, "(q) Quit"))));
};

(0, _ink.render)( /*#__PURE__*/_react.default.createElement(UI, null));
