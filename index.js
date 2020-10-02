import { Parser } from 'icecast-parser';
import query from 'querystring';
import http from 'http';
import lame from '@suldashi/lame';
import wav from 'wav';
import Speaker from 'speaker';
import volume from 'pcm-volume';
import React, { useState, useEffect } from 'react';
import { render, useInput, Box, Text, Newline } from 'ink';
import BigText from 'ink-big-text';
import Divider from 'ink-divider';
import Image from './image.dist';

const url = 'http://jenny.torontocast.com:8064/stream';

const decoder = new lame.Decoder();

const speaker = new Speaker({
  channels: 2,
  bitDepth: 16,
  sampleRate: 44100,
});

const vol = new volume();

const radioStation = new Parser({ url, notifyOnChangeOnly: true });

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function setTerminalTitle(title) {
  process.stdout.write(
    `${String.fromCharCode(27)}]0;${title}${String.fromCharCode(7)}`
  );
}

const UI = () => {
  const [tmpVol, setTmpVolume] = useState(0);
  const [v, setVolume] = useState(1);
  const [meta, setMeta] = useState({});

  useEffect(() => {
    radioStation.on('metadata', (metadata) => {
      let params = query.decode(metadata.get('StreamUrl'));
      setTerminalTitle(`${params.title} : ${params.artist} - ${params.album}`);
      setMeta(params);
    });

    http.get(url, (res) => {
      res.pipe(decoder);
    });

    decoder.on('format', (format) => {
      const writer = new wav.Writer(format);
      vol.setVolume(v);
      decoder.pipe(writer).pipe(vol).pipe(speaker);
    });

    return () => {};
  }, []);

  useEffect(() => {
    vol.setVolume(v);
  }, [v]);

  useInput((input, key) => {
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

  return (
    <Box flexDirection="column">
      <Box justifyContent="center">
        <BigText text="Epic Rock Radio" />
      </Box>

      <Box flexDirection="row" justifyContent="center">
        <Box
          borderStyle="bold"
          width="20%"
          justifyContent="center"
          alignItems="center"
        >
          <Image width="30%" src={meta.picture}></Image>
        </Box>

        <Box
          borderStyle="bold"
          width="80%"
          flexDirection="column"
          justifyContent="center"
          padding={1}
        >
          <Divider title="Now Playing"></Divider>
          <Newline></Newline>
          <Text bold>{meta.title}</Text>
          <Text>
            {meta.artist} - {meta.album}
          </Text>
          <Newline></Newline>

          <Divider title="Controls"></Divider>
          <Newline></Newline>
          <Text>(↑/↓) Volume: {v}</Text>
          <Text>(spc) Mute</Text>
          <Text>(q) Quit</Text>
        </Box>
      </Box>
    </Box>
  );
};

render(<UI />);
