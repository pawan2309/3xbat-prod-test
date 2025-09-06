import { NextPage } from 'next'
import Head from 'next/head'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>3xBat Control Panel</title>
        <meta name="description" content="3xBat Betting Platform - Control Panel" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
            Welcome to 3xBat Control Panel
          </h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-center">
              This is a placeholder page. The original source code was accidentally deleted.
            </p>
            <p className="text-gray-600 text-center mt-4">
              Please rebuild your application components here.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}

export default Home

