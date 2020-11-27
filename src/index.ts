import { BaseEntity, Between, Column, Connection, Entity, PrimaryGeneratedColumn, ValueTransformer } from 'typeorm'
import { BigNumber } from 'bignumber.js'

const main = async () => {

    const Money = (): PropertyDecorator => {
        return Column('numeric', { precision: 1e3, scale: 2 })
    }

    @Entity()
    class Account extends BaseEntity {
        @PrimaryGeneratedColumn('uuid')
        id: string

        @Column('text')
        username: string

        @Money()
        credit: number

    }

    class BigNumberFieldTransformer implements ValueTransformer {
        to(value: BigNumber): number {
            if (value) {
                return +value
            }

            return 0
        }

        from(value: number): BigNumber {
            if (value) {
                return new BigNumber(value)
            }

            return new BigNumber(0)
        }
    }


    const connection = new Connection({
        type: 'postgres',
        host: '127.0.0.1',
        port: 5432,
        database: 'test-db',
        username: 'postgres',
        password: 'postgres',
        entities: [Account],
    })

    await connection.connect()
    await connection.synchronize(true)

    const repository = connection.getRepository(Account)
    const saved = await repository.save([
        { username: 'jack', credit: 499.99 },
        { username: 'simon', credit: 100.50 },
        { username: 'drake', credit: 49.99 },
        { username: 'flock', credit: 9.08 },
        { username: 'joshua', credit: 0.1 + 0.2 /* stored as 0.30 */ },
        
    ])
    /*
    console.log(saved)
    */
    const q = await repository.find({
        order: {
            credit: 'DESC'
        },
        where: {
            credit: Between(50, 400)
        }
    })

    console.log(q)
}

main()