import type { NextPage } from 'next';
import { useEffect, useRef, useState, memo } from 'react';
import styled from 'styled-components';
import * as blobs2 from 'blobs/v2';

const Container = styled.div``;

const BlobObject = styled.svg``;

type Props = {
  color?: string;
  size?: number;
};

const Blob: NextPage<Props> = (props: Props) => {
  const blobRef = useRef<SVGElement>(null);

  const [svg, setSvg] = useState('<svg></svg>');

  useEffect(() => {
    const svgString = blobs2.svg(
      {
        seed: Math.random(),
        extraPoints: 8,
        randomness: 4,
        size: props.size ?? 256,
      },
      {
        fill: props.color ?? '#F1C21B',
      }
    );
    setSvg(svgString);
  }, [setSvg, props]);

  return <Container dangerouslySetInnerHTML={{ __html: svg }}></Container>;
};

export default memo(Blob);
