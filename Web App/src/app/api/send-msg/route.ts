import { NextRequest, NextResponse } from 'next/server';
import qs from 'qs';

export async function POST(req: NextRequest) {
  try {
  

    const data = qs.stringify({
      dlt_template_id: '1207161849448858474',
      sender_id: 'Hi',
      mobile_no: '9919253845',
      message:"hiii",
      unicode: '0'
    });

    const config = {
        method: 'post',
        url: 'https://obligr.io/api_v2/message/send',
        headers: {
          'Authorization': 'aSNj_u-D5yww7sGddEoKvGJRcjj1rSjjUxrnScLRwWpWGMBLBxuHk5aFrNmlq5Sl',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': '[COOKIES]'
        },
        data : data
      };

    return NextResponse.json({ message: 'Message sent successfully' });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}