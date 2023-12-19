/* eslint-disable @typescript-eslint/no-explicit-any */
import {useState} from "react";
import {useSearchParams} from "react-router-dom";
import axios from "axios";

const AUTHORIZE_LINK = `${
  import.meta.env.VITE_EPIC_BASE_URL
}/oauth2/authorize?response_type=code&redirect_uri=${
  import.meta.env.VITE_EPIC_REDIRECT_URI
}&client_id=${
  import.meta.env.VITE_EPIC_NON_PROD_CLIENT_ID
}&state=1234&scope=openid&aud=${
  import.meta.env.VITE_EPIC_BASE_URL
}/api/FHIR/R4`;

const getAccessToken = async (
  code: string,
  setResData: React.Dispatch<React.SetStateAction<any>>
) => {
  if (!code) return;

  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("redirect_uri", import.meta.env.VITE_EPIC_REDIRECT_URI);
  params.append("code", code);
  params.append("client_id", import.meta.env.VITE_EPIC_NON_PROD_CLIENT_ID);
  params.append("state", "1234");
  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  try {
    const res = await axios.post(
      "https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token",
      params,
      config
    );
    setResData(res.data);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

const fetchPatientInfo = async (
  patientId: string,
  accessToken: string,
  setPatientData: React.Dispatch<React.SetStateAction<any>>
) => {
  const res = await axios.get(
    `${import.meta.env.VITE_EPIC_BASE_URL}/api/FHIR/R4/Patient`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/fhir+json",
      },
    }
  );

  setPatientData(res.data);
  return res.data;
};

function App() {
  const [searchParams] = useSearchParams();
  const [resData, setResData] = useState<any>();
  const [patientData, setPatientData] = useState<any>();
  const code = searchParams.get("code");

  return (
    <div className="app">
      <h1 className="text-3xl font-bold text-lime-700 text-center mt-10">
        Demo App
      </h1>
      <div className="w-screen h-screen m-10">
        <a
          href={AUTHORIZE_LINK}
          className="h-max w-max bg-blue-600 px-3 py-1 text-white border-0 outline-none rounded-md block mb-4"
          target="_blank"
          rel="noreferrer"
        >
          Connect
        </a>

        {code && (
          <button
            onClick={() => getAccessToken(code as string, setResData)}
            className="bg-slate-600 text-white px-3 py-1 border-0 outline-none rounded-md block mb-4"
          >
            Get access token
          </button>
        )}

        {code && resData?.access_token && (
          <button
            onClick={() =>
              fetchPatientInfo(
                resData?.patient,
                resData?.access_token,
                setPatientData
              )
            }
            className="bg-green-600 text-white px-3 py-1 border-0 outline-none rounded-md"
          >
            Get Patient Info
          </button>
        )}

        <div className="mt-10">
          {resData?.access_token && patientData ? (
            <div>{patientData.name[0].text}</div>
          ) : (
            <p>Please connect first to get patient data</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
