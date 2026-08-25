import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { File, Files, Folder } from 'fumadocs-ui/components/files';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import { ImageZoom, type ImageZoomProps } from 'fumadocs-ui/components/image-zoom';
import { OrgChart } from '@/components/team/org-chart';
import type { MDXComponents } from 'mdx/types';

// `defaultMdxComponents` already provides Callout (+ CalloutContainer/Title/Description),
// Card, Cards, the CodeBlockTabs family and the pre/a/img/h1-h6/table overrides.
// Everything below is registered so no .mdx file ever needs a local import.
//
// Deliberately not registered:
// - Banner    — layout component (moves the site layout, owns a dismissal `id`), not page body.
// - InlineTOC — needs an `items` prop carrying the page's TOC data, which an MDX author can't supply.
// - GithubInfo / DynamicCodeBlock — irrelevant for a procedures manual.
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    // available in every .mdx file without a local import
    Step,
    Steps,
    Tab,
    Tabs,
    Accordion,
    Accordions,
    File,
    Files,
    Folder,
    TypeTable,
    ImageZoom,
    // MDX authors write a bare `<OrgChart />`; the docs page overrides this entry
    // with one bound to `params.lang` (`...components` is spread last, so it wins).
    // The 'en' default here only exists so the tag still renders if the component
    // map is used outside the localised docs route.
    OrgChart: () => <OrgChart lang="en" />,
    // reference photos (forms, booklets, scorecards) open in a zoom overlay
    img: (props) => <ImageZoom {...(props as ImageZoomProps)} />,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
