import { ImageResponse } from 'next/og';
export const size={width:180,height:180};
export const contentType='image/png';
export default function Icon(){return new ImageResponse(<div style={{display:'flex',width:'100%',height:'100%',alignItems:'center',justifyContent:'center',background:'#0F0D0B',color:'#F2C230',fontSize:100,fontWeight:700}}>FP</div>,size);}
