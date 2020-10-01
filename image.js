import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import terminalImage from 'terminal-image';
import got from 'got';

const Image = (props) => {
  const [imageData, setImageData] = useState('');

  useEffect(() => {
    (async () => {
      if (!props.src) return;
      const body = await got(
        `http://www.kaidata.com/pictures/${props.src}`
      ).buffer();
      const response = await terminalImage.buffer(body, {
        preserveAspectRatio: true,
        width: props.width,
        height: props.width,
      });
      setImageData(response);
    })();

    return () => {};
  }, [props.src]);

  return (
    <Box>
      <Text>{imageData}</Text>
    </Box>
  );
};

module.exports = Image;
