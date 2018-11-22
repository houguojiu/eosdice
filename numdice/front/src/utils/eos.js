import Eos from 'eosjs';
import network from './network';

export default Eos({
  keyProvider: '5JHW1R3o4hjXizJWjnK9zhPuEekHbGKdXMyH5F4Z1KxcgbnF32f',
  httpEndpoint: `${network.protocol}://${network.host}:${network.port}`,
  chainId: network.chainId
}); 
