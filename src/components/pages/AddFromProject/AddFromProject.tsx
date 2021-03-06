import React, { useState, useEffect } from "react";
import { Account } from "../../../types/Api";
import { Alert, Button, Form } from "react-bootstrap";
import "./AddFromProject.scss";
import RemixClient from '../../../RemixClient';
import upath from 'upath';

type Props = {
    contracts: { [id: string]: Account };
    refreshContracts: any;
}

export const AddFromProject: React.FC<Props> = ({ contracts, refreshContracts }) => {
    const [selectedContract, setSelectedContract] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!selectedContract && Object.entries(contracts).length > 0) {
            setSelectedContract(Object.values(contracts)[0].id);
        }
    }, [contracts]);

    const onSubmit = async (event: any) => {
        event.preventDefault();
        setShowAlert(false);

        const contract = contracts[selectedContract];

        if (!contract) {
            return;
        }


        const contractData = await RemixClient.getContract(contract.contract.network_id, contract.contract.address);

        if (!contractData) {
            setShowAlert(true);
            setSuccess(false);
            return;
        }

        for (const contractInfo of contractData.contract.data.contract_info) {
            await RemixClient.importContract(upath.toUnix(contractInfo.path), contractInfo.source);
        }

        setShowAlert(true);

        setSuccess(true);
    }

    const onRefreshContracts = async (event: any) => {
        event.preventDefault();

        await refreshContracts();

        if (!selectedContract && Object.entries(contracts).length > 0) {
            setSelectedContract(Object.values(contracts)[0].id);
        }
    }

    return (
        <div className="add-from-project-page">
            <Form onSubmit={onSubmit}>
                <Form.Group>
                    <Form.Label>Contract</Form.Label>
                    <Form.Control as="select" onChange={event => setSelectedContract(event.target.value)}
                        value={selectedContract}>
                        {!Object.entries(contracts).length && <option key="" value="">None</option>}
                        {Object.entries(contracts).map(([id, contract]) => {
                            return <option key={id}
                                value={id}>
                                {!!contract.display_name ? contract.display_name : contract.contract.contract_name}
                            </option>
                        })}
                    </Form.Control>
                    <Form.Text className="text-muted">
                        Please select the contract you want to import into Remix
                    </Form.Text>
                </Form.Group>

                <Form.Group>
                    <Button variant="primary" type="submit" disabled={!selectedContract}>
                        Import
                    </Button>
                    <Button variant="secondary" className="refresh-contracts-btn" type="button" onClick={onRefreshContracts}>
                        Refresh Contracts
                    </Button>
                </Form.Group>

                {showAlert && success && <Alert variant="success">
                    Contract successfully imported!
                </Alert>}
                {showAlert && !success && <Alert variant="danger">
                    Failed importing contract
                </Alert>}
            </Form>
        </div>
    );
}
