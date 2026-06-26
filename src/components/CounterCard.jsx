function CounterCard({value, label}) {
    return (
        <div className="flex flex-col items-center bg-neutral-800 rounded-2xl px-4 py-3 w-fit">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-neutral-500">{label}</p>
        </div>
    )
}

export default CounterCard;