export interface Property {
  id: number
  title: string
  address: string
  dte: Date
  sellerid: number
  price: number
  lat: number
  lon: number
  photobloburl: string | null
  typeofprop: "House"|"Apartment"|"Townhouse"|"Land"|"Rural"|"Commercial" | null
  suburb: string | null
  postcode: string | null
  state: string|null
  country:string|null
  beds: number | null
  baths: number | null
  carspaces: number | null
  landsize: number | null
  buildyear: number | null
  buildinginspazureblob:string|null,
  buildinginspverified:boolean|null,
  pestinspazureblob:string|null,
  pestinspverified:boolean|null,
  titlesrchcouncilrateazureblob:string|null,
  titlesrchcouncilrateverified:boolean|null
  titlesrchcouncilratepublic:boolean|null,
  pestinsppublic:boolean|null,
  buildinginsppublic:boolean|null,
  status:string|null,
  rejecvtedreason:string|null,
  poolcert:boolean|null,
  contractsale:boolean|null,
}
