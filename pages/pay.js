export default function PayPage({ sessionId }) {
  return (
    <html>
      <head>
        <script src="https://sdk.cashfree.com/js/ui/2.0.0/cashfree.sandbox.js"></script>
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          window.onload = function() {
            var cf = new Cashfree("${sessionId}");
            cf.redirect();
          }
        `,
          }}
        />
        <p>Redirecting to payment...</p>
      </body>
    </html>
  );
}

export async function getServerSideProps({ query }) {
  return {
    props: { sessionId: query.session || "" },
  };
}
