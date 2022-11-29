import { join } from 'path';
import { writeFileSync, readFileSync, PathOrFileDescriptor } from 'fs';

import { extend, flatten, uniq } from 'lodash';

interface IOptions {
  template: string;
  useBuildPath: boolean;
  filename: string;
}

class JspWebPackPlugin {
  options: { template: string; useBuildPath: boolean; filename: string } & IOptions;
  jspFile: string;
  constructor(options: IOptions) {
    // Default options
    this.options = extend(
      {
        template: join(__dirname, 'index.jsp'),
        useBuildPath: true,
        filename: 'index.jsp',
      },
      options,
    );

    this.jspFile = this.getFileContent(this.options.template);
  }

  apply(compiler: { hooks: { emit: { tap: (arg0: string, arg1: (compilation: any) => void) => void } } }) {
    compiler.hooks.emit.tap('JspWebPackPlugin', (compilation) => {
      const { filename } = this.options;

      this.getAllChunks(compilation).forEach((chunk: string) => {
        const chunkExtension = this.getChunkExtension(chunk);
        switch (chunkExtension) {
          case 'js':
            this.insertScript(chunk);
            return;
          case 'css':
            this.insertStyle(chunk);
            return;
          default:
            return;
        }
      });

      writeFileSync(filename, this.jspFile);
    });
  }

  getFileContent(filename: PathOrFileDescriptor) {
    return readFileSync(filename, 'utf8');
  }

  getAllChunks(compilation: { getStats: () => { (): any; new (): any; toJson: { (): any; new (): any } } }): any[] {
    const jsonCompilation = compilation.getStats().toJson();
    return uniq(flatten(jsonCompilation.chunks.map((chunk: { files: any }) => chunk.files))).reverse();
  }

  getChunkExtension(chunk: string) {
    const splittedChunk = chunk.split('.');
    return splittedChunk[splittedChunk.length - 1];
  }

  insertScript(chunk: string) {
    const bodyRegExp = /(<\/body\s*>)/i;
    const scriptTag = this.generateScriptTag(chunk);

    if (bodyRegExp.test(this.jspFile)) {
      // Append assets to body element
      this.jspFile = this.jspFile.replace(bodyRegExp, (match) => scriptTag + match);
    } else {
      // Append scripts to the end of the file if no <body> element exists:
      this.jspFile += chunk;
    }
  }

  insertStyle(chunk: unknown) {
    const headRegExp = /(<\/head\s*>)/i;
    const styleTag = this.generateStyleTag(chunk);

    if (headRegExp.test(this.jspFile)) {
      // Append assets to head element
      this.jspFile = this.jspFile.replace(headRegExp, (match) => styleTag + match);
    }
  }

  generateScriptTag(chunk: any) {
    return `<script type="text/javascript" src="${
      this.options.useBuildPath ? `<%= buildPath(request,"/${chunk}")%>` : chunk
    }" charset="utf-8"></script>`;
  }

  generateStyleTag(chunk: any) {
    return `<link rel="stylesheet" href="${
      this.options.useBuildPath ? `<%= buildPath(request,"/${chunk}")%>` : chunk
    }" />`;
  }
}

export default JspWebPackPlugin;
