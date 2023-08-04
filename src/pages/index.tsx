import { useEffect, useState } from 'react'

export default function home() {
	const [number, setNumber] = useState<number>()
	useEffect(() => {
		fetch('/api/randomNumber')
			.then(response => response.text())
			.then(text => setNumber(+text))
	}, [])
	return <div>Random Number: {number}</div>
}
