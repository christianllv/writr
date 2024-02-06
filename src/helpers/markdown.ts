import pkg from '@markdoc/markdoc';
const { Tag } = pkg;

export class MarkdownHelper {
  static fence() {
    return {
      attributes: {
        language: { type: String }
      },
      transform(node: any, config: any) {
        const attributes = node.transformAttributes(config);

        const processedChildren = node.transformChildren(config);
        const languageClass = attributes.language ? `language-${attributes.language}` : '';
        const codeAttributes = languageClass ? { class: languageClass } : {};

        const codeTag = new Tag('code', codeAttributes, processedChildren.join(''));

        return new Tag('pre', {}, [codeTag]);
      }
    }
  }
}
