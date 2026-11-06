import { ImageResponse } from 'next/og';
export const alt='Flames Partner — rotating savings';
export const size={width:1200,height:630};
export const contentType='image/png';
export default function Image(){return new ImageResponse(<div style={{display:'flex',width:'100%',height:'100%',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#0F0D0B',color:'#F2C230',fontFamily:'sans-serif'}}><div style={{fontSize:100,fontWeight:700}}>FLAMES PARTNER</div><div style={{fontSize:36,marginTop:32}}>The rotating savings programme.</div></div>,size);}
