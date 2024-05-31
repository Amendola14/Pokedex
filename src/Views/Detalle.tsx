import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody, CardText, Badge, Progress } from 'reactstrap';
import axios from 'axios';
import PokeTarjeta from '../Components/PokeTarjeta';

interface PokemonData {
  name: string;
  height: number;
  weight: number;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string | null;
      };
    };
  };
  types: {
    type: {
      name: string;
      url: string;
    };
  }[];
  abilities: {
    ability: {
      name: string;
      url: string;
    };
  }[];
  species: {
    name: string;
    url: string;
  };
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];
}

interface SpeciesData {
  habitat: {
    name: string;
  } | null;
  flavor_text_entries: {
    language: {
      name: string;
    };
    flavor_text: string;
  }[];
  evolution_chain: {
    url: string;
  };
}

interface EvolutionChainData {
  chain: {
    species: {
      name: string;
      url: string;
    };
    evolves_to: EvolutionChainData['chain'][];
  };
}

const statTranslations: { [key: string]: string } = {
  hp: 'Puntos de salud',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'Ataque especial',
  'special-defense': 'Defensa especial',
  speed: 'Velocidad',
};

const habitatTranslations: { [key: string]: string } = {
  cave: 'Cueva',
  forest: 'Bosque',
  grassland: 'Pradera',
  mountain: 'Montaña',
  rare: 'Raro',
  rough_terrain: 'Terreno áspero',
  sea: 'Mar',
  urban: 'Urbano',
  waters_edge: 'Orilla de agua',
  unknown: 'Desconocido',
};

const Detalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [Pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [Habitat, setHabitat] = useState<string>('desconocido');
  const [Descripcion, setDescripcion] = useState<string>('');
  const [Imagen, setImagen] = useState<string | null>(null);
  const [Tipos, setTipos] = useState<string[]>([]);
  const [Habilidades, setHabilidades] = useState<string[]>([]);
  const [Estadisticas, setEstadisticas] = useState<{ nombre: string; valor: number }[]>([]);
  const [ListaEvoluciones, setListaEvoluciones] = useState<{ name: string; url: string }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    getPokemon();
  }, [id]);

  const getPokemon = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<PokemonData>(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = response.data;
      setPokemon(data);
      setImagen(data.sprites.other['official-artwork'].front_default);
      setTipos(data.types.map((t) => t.type.name));
      setHabilidades(data.abilities.map((a) => a.ability.name));
      setEstadisticas(data.stats.map((s) => ({ nombre: statTranslations[s.stat.name] || s.stat.name, valor: s.base_stat })));
      getEspecie(data.species.name);
    } catch (error) {
      console.error('Error fetching Pokemon data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEspecie = async (especieName: string) => {
    try {
      const response = await axios.get<SpeciesData>(`https://pokeapi.co/api/v2/pokemon-species/${especieName}`);
      const data = response.data;
      setHabitat(habitatTranslations[data.habitat?.name || 'unknown']);
      const flavorText = data.flavor_text_entries.find((entry) => entry.language.name === 'es');
      setDescripcion(flavorText ? flavorText.flavor_text : '');
      getEvolucion(data.evolution_chain.url);
    } catch (error) {
      console.error('Error fetching species data:', error);
    }
  };

  const getEvolucion = async (evolucionURL: string) => {
    try {
      const response = await axios.get<EvolutionChainData>(evolucionURL);
      const evoluciones = procesaEvoluciones(response.data.chain);
      setListaEvoluciones(evoluciones);
    } catch (error) {
      console.error('Error fetching evolution data:', error);
    }
  };

  const procesaEvoluciones = (chain: EvolutionChainData['chain']): { name: string; url: string }[] => {
    let evoluciones: { name: string; url: string }[] = [];
    let currentChain = chain;
    while (currentChain) {
      evoluciones.push({ name: currentChain.species.name, url: `https://pokeapi.co/api/v2/pokemon/${currentChain.species.name}` });
      currentChain = currentChain.evolves_to[0];
    }
    return evoluciones;
  };

  return (
    <Container className="bg-danger mt-3">
      <Row>
        <Col>
          <Card className="shadow mt-3 mb-3">
            <CardBody className="m-3">
              <Row>
                <Col className="text-end">
                  <Link to="/" className="btn btn-warning">
                    <i className="fa-solid fa home"></i>Inicio
                  </Link>
                </Col>
              </Row>
              {isLoading ? (
                <Row>
                  <Col md="12">
                    <img src="/img/loading.gif" className="w-100" alt="Cargando" />
                  </Col>
                </Row>
              ) : (
                Pokemon && (
                  <>
                    <Row>
                      <Col md="6">
                        <CardText className="fs-3">{Descripcion}</CardText>
                        <CardText className="fs-5">
                          Altura: <b>{Pokemon.height / 10}m</b>, Peso: <b>{Pokemon.weight / 10}kg</b>
                        </CardText>
                        <CardText className="fs-3">
                          Tipo:{' '}
                          {Tipos.map((tip, i) => (
                            <Badge pill className="me-1" color="danger" key={i}>
                              {tip}
                            </Badge>
                          ))}
                        </CardText>
                        <CardText className="fs-3 h1 text-capitalize">Hábitat: {Habitat}</CardText>
                        <CardText className="fs-3">
                          Habilidades:{' '}
                          {Habilidades.map((hab, i) => (
                            <Badge pill className="me-1" color="dark" key={i}>
                              {hab}
                            </Badge>
                          ))}
                        </CardText>
                      </Col>
                      <Col md="6">
                        <img src={Imagen || ''} className="img-fluid" alt="Pokemon" />
                      </Col>
                      <Col md="12 mt-3">
                        <CardText className="fs-4 text-center">
                          <b>Estadísticas</b>
                        </CardText>
                      </Col>
                      <Col>
                        {Estadisticas.map((es, i) => (
                          <Row key={i}>
                            <Col xs="6" md="3">
                              <b>{es.nombre}</b>
                            </Col>
                            <Col xs="6" md="9">
                              <Progress className="my-2" value={es.valor}>
                                {es.valor}
                              </Progress>
                            </Col>
                          </Row>
                        ))}
                      </Col>
                      <Col md="12 mt-2">
                        <CardText className="fs-4 text-center">
                          <b>Cadena de Evolución</b>
                        </CardText>
                      </Col>
                    </Row>
                    <Row  className="justify-content-center">
                    {ListaEvoluciones.map((poke, i) => (
    <Col key={i} xs='12' sm='6' md='4' lg='3' className='d-flex justify-content-center mb-4'>
      <PokeTarjeta poke={poke} />
    </Col>
                      ))}
                    </Row>
                  </>
                )
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Detalle;
