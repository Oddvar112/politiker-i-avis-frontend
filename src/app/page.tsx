import Layout from "../components/Layout";

export default function Home() {
  return (
    <Layout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            Velkommen til Kvasir
          </h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Velg en avis fra sidepanelet for å komme i gang med å lese nyheter.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Siste nyheter</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Få tilgang til de siste nyhetene fra alle dine favorittaviser på ett sted.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Personalisert feed</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Kvasir hjelper deg med å finne de mest relevante nyhetene for deg.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
