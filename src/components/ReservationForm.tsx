import React, { useEffect, useState } from "react";
import Input from "@components/Input.tsx";

export function ReservationForm() {

    return (
        <div className="bg-card row-span-2 p-4">
        <h2 className="text-accent-light font-serif text-3xl">
            Detalles de la Reserva
        </h2>
        <Input id="input-day" labelText="Fecha" type="date" />
        <div className="flex flex-row gap-4">
            <Input id="input-time" labelText="Hora" type="time" />
            <Input
            id="input-people"
            labelText="Comensales"
            type="number"
            placeholder="Ej: 2"
            min={2}
            />
        </div>
        <Input
            id="input-name"
            labelText="Nombre Completo"
            type="text"
            placeholder="Tu nombre"
        />
        <Input
            id="input-phone"
            labelText="Teléfono"
            type="tel"
            placeholder="+34 XXX XXX XXX"
        />
        <button className="text-primary font-bold bg-transparent border border-[#e5432e] hover:bg-[#e5432e] cursor-pointer transition-all duration-300 rounded-sm p-4 w-full">
            CONFIRMAR RESERVA
        </button>
        </div>
    );
}
