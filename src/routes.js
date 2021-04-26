// routes.js
import Simulation from './Simulation.svelte'
import HomePage from './HomePage.svelte'
import Demo from './Demo.svelte'

export default [
	{
		path: '/',
		component: HomePage
	},
	{
		path: '/simulation',
		component: Simulation
	},
	{
		path: '/demo',
		component: Demo
	}
]