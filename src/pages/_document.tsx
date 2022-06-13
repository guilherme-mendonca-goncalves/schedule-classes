import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

class NextDocument extends Document {
  static async getInitialProps(context: DocumentContext): Promise<DocumentInitialProps>  {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = context.renderPage;
    try {
      context.renderPage = () => {
        return originalRenderPage({
          enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
        });
      };
      const initialProps = await Document.getInitialProps(context);
      const styles = [
        <>
          {initialProps.styles}
          {sheet.getStyleElement()}
        </>
      ];

      return {
        ...initialProps,
        styles,
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html lang="pt-BR">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default NextDocument;
