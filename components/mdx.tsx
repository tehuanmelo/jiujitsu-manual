import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { ImageZoom, type ImageZoomProps } from 'fumadocs-ui/components/image-zoom';
import type { MDXComponents } from 'mdx/types';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    // available in every .mdx file without a local import
    Step,
    Steps,
    // reference photos (forms, booklets, scorecards) open in a zoom overlay
    img: (props) => <ImageZoom {...(props as ImageZoomProps)} />,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
