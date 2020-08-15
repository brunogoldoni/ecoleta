import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";

import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

import { LeafletMouseEvent } from "leaflet";
import { Map, TileLayer, Marker } from "react-leaflet";

import axios from "axios";
import api from "../../services/api";

import logo from "../../assets/logo.svg";

import "./styles.css";

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const CreatePoint = () => {
  const [isUFs, setIsUFs] = useState<string[]>([]);
  const [isItems, setIsItems] = useState<Item[]>([]);
  const [isCities, setIsCities] = useState<string[]>();
  const [isSelectedUF, setIsSelectedUF] = useState("0");
  const [isSelectedCity, setIsSelectedCity] = useState("0");
  const [isSelectedItems, setIsSelectedItems] = useState<number[]>([]);
  const [isFormData, setIsFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });
  const [isInitialPosition, setIsInitialPosition] = useState<[number, number]>([
    0,
    1,
  ]);
  const [isSelectedPosition, setIsSelectedPosition] = useState<
    [number, number]
  >([0, 1]);

  useEffect(() => {
    api.get("items").then((response) => {
      setIsItems(response.data);
    });
  });

  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
      )
      .then((response) => {
        const isUFInitials = response.data.map((uf) => uf.sigla);

        setIsUFs(isUFInitials);
      });
  }, []);

  useEffect(() => {
    if (isSelectedUF === "0") {
      return;
    }

    axios
      .get<IBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${isSelectedUF}/municipios`
      )
      .then((response) => {
        const citiesName = response.data.map((city) => city.nome);

        setIsCities(citiesName);
      });
  }, [isSelectedUF]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      setIsInitialPosition([latitude, longitude]);
    });
  });

  function handleSelectUF(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;

    setIsSelectedUF(uf);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;

    setIsSelectedCity(city);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setIsSelectedPosition([event.latlng.lat, event.latlng.lng]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setIsFormData({ ...isFormData, [name]: value });
  }

  function handleSelectItem(id: number) {
    const alreadySelected = isSelectedItems.findIndex((item) => item === id);

    if (alreadySelected >= 0) {
      const filteredItems = isSelectedItems.filter((item) => item !== id);

      setIsSelectedItems(filteredItems);
    } else {
      setIsSelectedItems([...isSelectedItems, id]);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const uf = isSelectedUF;
    const city = isSelectedCity;
    const items = isSelectedItems;
    const { name, email, whatsapp } = isFormData;
    const [latitude, longitude] = isSelectedPosition;

    const data = {
      uf,
      city,
      name,
      email,
      items,
      whatsapp,
      latitude,
      longitude,
    };

    await api.post("points", data);

    alert("Ponto de coleta criado com sucesso!");
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />

        <Link to="/">
          <FiArrowLeft />
          voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do</h1>
        <h1>ponto de coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
        </fieldset>

        <div className="field">
          <label htmlFor="name">Nome da entidade</label>
          <input
            id="name"
            type="text"
            name="name"
            onChange={handleInputChange}
          />
        </div>

        <div className="field-group">
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              name="email"
              onChange={handleInputChange}
            />
          </div>

          <div className="field">
            <label htmlFor="whatsapp">Whatsapp</label>
            <input
              id="whatsapp"
              type="number"
              name="whatsapp"
              onChange={handleInputChange}
            />
          </div>
        </div>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço do mapa</span>
          </legend>
        </fieldset>

        <Map zoom={15} onClick={handleMapClick} center={isInitialPosition}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />

          <Marker position={isSelectedPosition} />
        </Map>

        <div className="field-group">
          <div className="field">
            <label htmlFor="uf">Estado (UF)</label>
            <select
              id="uf"
              name="uf"
              value={isSelectedUF}
              onChange={handleSelectUF}
            >
              {isUFs.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="city">Cidade</label>
            <select
              id="city"
              name="city"
              value={isSelectedCity}
              onChange={handleSelectCity}
            >
              {isCities?.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>

          <ul className="items-grid">
            {isItems.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                className={isSelectedItems.includes(item.id) ? "selected" : ""}
              >
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
